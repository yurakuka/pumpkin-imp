import { spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { root, git, gh, env } from './tooling.mjs';

function run(command, args, capture = false) {
  const result = spawnSync(command, args, { cwd: root, env: { ...env, GIT_TERMINAL_PROMPT: '0', GH_PROMPT_DISABLED: '1' }, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(capture ? result.stderr?.trim() || `${command} failed` : `${command} failed (exit ${result.status}). No force push was attempted.`);
  return result.stdout?.trim();
}
try {
  const branch = run(git, ['branch', '--show-current'], true);
  if (branch !== 'main') throw new Error('Publish from main only. Merge and review your branch first.');
  const remote = run(git, ['remote', 'get-url', 'origin'], true);
  if (!/^https:\/\/github\.com\/yurakuka\/pumpkin-imp(?:\.git)?$/.test(remote) && remote !== 'git@github.com:yurakuka/pumpkin-imp.git') throw new Error('origin does not point to yurakuka/pumpkin-imp.');
  run(gh, ['auth', 'status', '--hostname', 'github.com']);
  if (process.argv.includes('--check')) {
    run(git, ['status', '--short']);
    run(git, ['push', '--dry-run', 'origin', 'HEAD:main']);
    console.log('GitHub publishing is ready.');
    process.exit(0);
  }
  console.log('Building the game before publishing…');
  run(process.execPath, ['scripts/build.mjs']);
  run(git, ['add', '--all']);
  const changed = run(git, ['diff', '--cached', '--name-only'], true);
  if (changed) {
    const message = process.argv.slice(2).join(' ').trim() || 'Update Pumpkin Imp';
    run(git, ['commit', '-m', message]);
  }
  // Push an existing local commit too, so retrying after a network failure works.
  const sha = run(git, ['rev-parse', 'HEAD'], true);
  run(git, ['push', '--set-upstream', 'origin', 'HEAD:main']);
  let workflowRun;
  for (let attempt = 0; attempt < 18; attempt++) {
    const runs = JSON.parse(run(gh, ['run', 'list', '--repo', 'yurakuka/pumpkin-imp', '--workflow', 'deploy.yml', '--branch', 'main', '--commit', sha, '--limit', '1', '--json', 'databaseId,status,conclusion'], true));
    if (runs.length) { workflowRun = runs[0]; break; }
    await delay(5000);
  }
  if (!workflowRun) throw new Error('Changes were pushed, but the Actions run has not appeared yet. Check GitHub Actions; do not create another commit just to retry.');
  run(gh, ['run', 'watch', String(workflowRun.databaseId), '--repo', 'yurakuka/pumpkin-imp', '--exit-status', '--interval', '5']);
  console.log('Published successfully: https://yurakuka.github.io/pumpkin-imp/');
} catch (error) {
  console.error(`Publication stopped: ${error.message}`);
  process.exitCode = 1;
}
