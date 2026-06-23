import http from 'http';
import net from 'net';

const TARGET = 3000;
const PORT = 3001;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(302, { Location: '/admin/dashboard' });
    return res.end();
  }
  const opts = {
    hostname: 'localhost', port: TARGET,
    path: req.url, method: req.method,
    headers: { ...req.headers, host: `localhost:${TARGET}` },
  };
  const p = http.request(opts, (r) => {
    res.writeHead(r.statusCode, r.headers);
    r.pipe(res);
  });
  p.on('error', () => { res.writeHead(502); res.end('Backend not ready'); });
  req.pipe(p);
});

server.on('upgrade', (req, socket, head) => {
  const conn = net.connect(TARGET, 'localhost', () => {
    const headers = Object.entries({ ...req.headers, host: `localhost:${TARGET}` })
      .map(([k, v]) => `${k}: ${v}`).join('\r\n');
    conn.write(`${req.method} ${req.url} HTTP/1.1\r\n${headers}\r\n\r\n`);
    if (head.length) conn.write(head);
    conn.pipe(socket);
    socket.pipe(conn);
  });
  conn.on('error', () => socket.destroy());
  socket.on('error', () => conn.destroy());
});

server.listen(PORT, () =>
  console.log(`\x1b[32m✓ Admin proxy → http://localhost:${PORT}/admin/dashboard\x1b[0m`)
);
