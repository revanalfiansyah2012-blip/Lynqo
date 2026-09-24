const express = require('express');
const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Express/4.19.2');
  res.setHeader('Server', 'nginx/1.18.0');
  res.setHeader('Set-Cookie', 'session=secret_token_12345; Path=/; HttpOnly=false;');
  next();
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>LynQo Test Target</title></head>
      <body>
        <h1>LynQo Test Target</h1>
        <a href="/about">About</a>
        <a href="/api/users">API Users</a>
      </body>
    </html>
  `);
});

app.get('/about', (req, res) => {
  res.send('<h1>About Page</h1>');
});

app.get('/api/users', (req, res) => {
  res.json({ status: 'ok', users: ['Alice', 'Bob'] });
});

app.listen(PORT, () => {
  console.log(`Test target running on http://localhost:${PORT}`);
});
