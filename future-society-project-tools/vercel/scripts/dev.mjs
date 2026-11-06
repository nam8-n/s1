// 로컬 확인용 서버: public 폴더와 /api 함수를 Vercel과 같은 주소로 보여 줍니다.
// 실행: npm run dev (.env 필요)  → http://localhost:3000
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css' };

export function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname.startsWith('/api/')) {
        const name = url.pathname.slice(5).replace(/[^a-z]/g, '');
        const mod = await import(join(root, 'api', name + '.js')).catch(() => null);
        const fn = mod && mod[req.method];
        if (!fn) { res.writeHead(404); return res.end('not found'); }
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const ac = new AbortController();
        res.on('close', () => { if (!res.writableEnded) ac.abort(); });
        const r = await fn(new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks), signal: ac.signal }));
        res.writeHead(r.status, Object.fromEntries(r.headers));
        if (r.body) for await (const c of r.body) res.write(c);
        return res.end();
      }
      let p = url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname;
      if (p.includes('..')) { res.writeHead(400); return res.end(); }
      const data = await readFile(join(root, 'public', p));
      res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
      res.end(data);
    } catch (e) {
      res.writeHead(e.code === 'ENOENT' ? 404 : 500);
      res.end(e.code === 'ENOENT' ? 'not found' : 'error');
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => console.log('http://localhost:' + port));
}
