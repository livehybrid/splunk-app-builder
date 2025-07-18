const assert = require('assert');
const { generateCode } = require('./claude');
const { pushToGitHub } = require('./github');
const fs = require('fs');
const path = require('path');

(async () => {
  const saveOpen = process.env.OPENROUTER_API_KEY;
  const saveAnthro = process.env.ANTHROPIC_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  const res = await generateCode('test');
  assert.strictEqual(res, '');
  if (saveOpen) process.env.OPENROUTER_API_KEY = saveOpen;
  if (saveAnthro) process.env.ANTHROPIC_API_KEY = saveAnthro;
  const tmp = fs.mkdtempSync(path.join(__dirname, 'tmp'));
  const ok = pushToGitHub(tmp, 'invalid/repo', 'token');
  assert.strictEqual(ok, false);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('Tests passed');
})();
