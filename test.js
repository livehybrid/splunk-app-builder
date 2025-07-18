const assert = require('assert');
const { generateCode } = require('./claude');

(async () => {
  const saveOpen = process.env.OPENROUTER_API_KEY;
  const saveAnthro = process.env.ANTHROPIC_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  const res = await generateCode('test');
  assert.strictEqual(res, '');
  if (saveOpen) process.env.OPENROUTER_API_KEY = saveOpen;
  if (saveAnthro) process.env.ANTHROPIC_API_KEY = saveAnthro;
  console.log('Tests passed');
})();
