const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { generateCode } = require('./claude');

function ensureUccGen() {
  try {
    execSync('which ucc-gen', { stdio: 'ignore' });
  } catch {
    try {
      execSync('pip install --quiet splunk-add-on-ucc-framework');
    } catch (e) {
      console.warn('Failed to install ucc-gen:', e.message);
    }
  }
}

function runUccGen(dir, meta) {
  ensureUccGen();
  try {
    execSync(`ucc-gen --output ${dir} --addon-name ${meta.appName}`, { stdio: 'inherit' });
  } catch (e) {
    fs.writeFileSync(path.join(dir, 'ucc_error.log'), String(e));
  }
}

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const GEN_DIR = path.join(__dirname, 'generated');

function serveStatic(req, res) {
  const filePath = req.url === '/' ? '/index.html' : req.url;
  const fullPath = path.join(PUBLIC_DIR, filePath);
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(fullPath).toLowerCase();
    const type = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript'
    }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

async function handleGenerate(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      const meta = {
        appName: (data.appName || 'my_app').replace(/\W+/g, '_'),
        author: data.author || '',
        version: data.version || '1.0.0',
        description: data.description || '',
        inputType: data.inputType || ''
      };

      const appDir = path.join(GEN_DIR, meta.appName);
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(path.join(appDir, 'metadata.json'), JSON.stringify(meta, null, 2));
      fs.writeFileSync(path.join(appDir, 'README.txt'), `Generated Splunk app: ${meta.appName}\n${meta.description}\n`);
      runUccGen(appDir, meta);

      if (process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY) {
        try {
          const prompt = `You are a senior Splunk developer. Build a minimal Splunk Add-on using the UCC Framework.\nName: ${meta.appName}\nAuthor: ${meta.author}\nVersion: ${meta.version}\nDescription: ${meta.description}\nInput: ${meta.inputType}\nReturn only the contents of addon.py implementing a placeholder modular input.`;
          const code = await generateCode(prompt);
          fs.writeFileSync(path.join(appDir, 'addon.py'), code);
        } catch (e) {
          fs.writeFileSync(path.join(appDir, 'claude_error.log'), String(e));
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', app: meta.appName }));
    } catch (e) {
      res.writeHead(500);
      res.end('Error generating app');
    }
  });
}

function handleDownload(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const app = url.searchParams.get('app');
  if (!app) {
    res.writeHead(400);
    res.end('Missing app parameter');
    return;
  }
  const appDir = path.join(GEN_DIR, app);
  if (!fs.existsSync(appDir)) {
    res.writeHead(404);
    res.end('App not found');
    return;
  }
  const zipPath = path.join(GEN_DIR, `${app}.zip`);
  try {
    execSync(`zip -r ${zipPath} ${app}`, { cwd: GEN_DIR });
    const zipData = fs.readFileSync(zipPath);
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${app}.zip"`
    });
    res.end(zipData);
  } catch (e) {
    res.writeHead(500);
    res.end('Error creating archive');
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/generate') {
    return handleGenerate(req, res);
  } else if (req.method === 'GET' && req.url.startsWith('/api/download')) {
    return handleDownload(req, res);
  } else {
    return serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
