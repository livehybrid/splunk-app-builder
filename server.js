const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function handleGenerate(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const appName = (data.appName || 'my_app').replace(/\W+/g, '_');
      const appDir = path.join(GEN_DIR, appName);
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(path.join(appDir, 'README.txt'), `Generated Splunk app: ${appName}\n`);
      fs.writeFileSync(path.join(appDir, 'metadata.json'), JSON.stringify(data, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', app: appName }));
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
