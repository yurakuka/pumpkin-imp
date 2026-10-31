// Static hosting only. Each browser still runs an independent, offline game.
// Keep a complete build snapshot in memory: editing/rebuilding sources cannot
// reload a player's page or leave a half-written bundle during an active run.
import { createServer } from 'node:http';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';

const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const files = new Map();
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
async function snapshot(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await snapshot(path);
    else if (entry.isFile()) files.set('/' + relative(root, path).split('\\').join('/'), await readFile(path));
  }
}
try {
  await snapshot(root);
  if (!files.has('/index.html')) throw new Error('Missing dist/index.html');
} catch (error) {
  console.error('Build the game first with npm run build.', error.message);
  process.exit(1);
}
function respond(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  let path;
  try { path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end('Bad request'); return; }
  if (path === '/') path = '/index.html';
  const file = files.get(path);
  if (!file) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not found'); return; }
  res.writeHead(200, {
    'Content-Type': mime[extname(path)] || 'application/octet-stream',
    'Content-Length': file.length,
    'Cache-Control': path.endsWith('.html') ? 'no-store' : 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(req.method === 'HEAD' ? undefined : file);
}
const servers = [];
for (const [host, port] of [['127.0.0.1', 5173], ['0.0.0.0', 5175]]) {
  const server = createServer(respond);
  server.on('error', error => { console.error(`Cannot serve port ${port}: ${error.message}`); for (const s of servers) s.close(); process.exitCode = 1; });
  server.listen(port, host, () => console.log(`Stable game: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/`));
  servers.push(server);
}
for (const addresses of Object.values(networkInterfaces())) for (const address of addresses || []) {
  if (address.family === 'IPv4' && !address.internal) console.log(`Wi-Fi / LAN: http://${address.address}:5175/`);
}
function stop() { for (const server of servers) server.close(); }
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
