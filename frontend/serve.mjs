import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const port = Number(process.argv[2] || 3000);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  if (filePath.startsWith('/api/')) {
    res.writeHead(502, {'Content-Type':'application/json'});
    res.end(JSON.stringify({error:'API traffic belongs on the FastAPI server at :8000'}));
    return;
  }
  const safePath = path.normalize(path.join(root, filePath));
  if (!safePath.startsWith(root)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.readFile(safePath, (err, data) => {
    if (err) {
      // SPA fallback
      fs.readFile(path.join(root, 'index.html'), (fallbackErr, fallback) => {
        if (fallbackErr) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(fallback);
      });
      return;
    }
    res.writeHead(200, {'Content-Type': mime[path.extname(safePath)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
    res.end(data);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`CIVICSOLVE AI frontend → http://localhost:${port}`);
});
