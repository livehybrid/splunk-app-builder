const https = require('https');
const Anthropic = require('@anthropic-ai/sdk');

/**
 * Call the Anthropic completion API.
 * @param {string} prompt
 * @param {string} apiKey
 */
async function callAnthropic(prompt, apiKey) {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 4096,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }]
  });
  return response.content?.[0]?.text || '';
}

/**
 * Call the OpenRouter API using the Anthropic model.
 * @param {string} prompt
 * @param {string} apiKey
 */
function callOpenRouter(prompt, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'anthropic/claude-3-opus',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const text = parsed.choices && parsed.choices[0] && parsed.choices[0].message && parsed.choices[0].message.content;
          resolve(text || '');
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Generate code using either Anthropic or OpenRouter depending on
 * available API keys.
 * @param {string} prompt - Prompt describing the code to generate
 * @returns {Promise<string>} - Generated code or empty string if no API key
 */
function generateCode(prompt) {
  if (process.env.OPENROUTER_API_KEY) {
    return callOpenRouter(prompt, process.env.OPENROUTER_API_KEY);
  } else if (process.env.ANTHROPIC_API_KEY) {
    return callAnthropic(prompt, process.env.ANTHROPIC_API_KEY);
  }
  return Promise.resolve('');
}

module.exports = { generateCode };
