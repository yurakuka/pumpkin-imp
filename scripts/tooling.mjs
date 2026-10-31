import { existsSync } from 'node:fs';
import { dirname, join, delimiter } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
const bundled = join(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git');
export const git = existsSync(join(bundled, 'bin/git')) ? join(bundled, 'bin/git') : 'git';
export const gh = existsSync(join(root, '.tools/bin/gh')) ? join(root, '.tools/bin/gh') : 'gh';
export const env = { ...process.env, PATH: [join(root, '.tools/bin'), dirname(process.execPath), ...(git === 'git' ? [] : [dirname(git)]), process.env.PATH || ''].join(delimiter) };
if (git !== 'git') {
  env.GIT_EXEC_PATH = join(bundled, 'libexec/git-core');
  env.GIT_TEMPLATE_DIR = join(bundled, 'share/git-core/templates');
}
