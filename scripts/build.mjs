import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
// Some local esbuild service starts terminate before compiling any modules.
// Retry that specific transient failure once; real compiler errors still fail.
for (let attempt = 0; attempt < 2; attempt++) {
  const result = await new Promise(resolve => {
    const child = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--configLoader', 'native'], { cwd: root, stdio: ['inherit', 'pipe', 'pipe'] });
    let output = '';
    const forward = target => data => { target.write(data); output = (output + data).slice(-200000); };
    child.stdout.on('data', forward(process.stdout));
    child.stderr.on('data', forward(process.stderr));
    child.on('error', error => resolve({ code: 1, output: error.message }));
    child.on('close', (code, signal) => resolve({ code, signal, output }));
  });
  if (result.code === 0) break;
  if (attempt === 0 && !result.signal && result.output.includes('The service was stopped')) {
    console.error('Build service stopped unexpectedly; retrying once…');
    await delay(600);
    continue;
  }
  process.exitCode = result.code || 1;
  break;
}
