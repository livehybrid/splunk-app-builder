const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function pushToGitHub(appDir, repo, token) {
  try {
    execSync('git init', { cwd: appDir });
    execSync('git add .', { cwd: appDir });
    execSync('git commit -m "Initial commit"', { cwd: appDir });
    const remote = `https://${token}@github.com/${repo}.git`;
    execSync(`git push ${remote} master --force`, { cwd: appDir, stdio: 'ignore' });
    return true;
  } catch (e) {
    try {
      fs.writeFileSync(path.join(appDir, 'github_error.log'), String(e));
    } catch {}
    return false;
  }
}

module.exports = { pushToGitHub };
