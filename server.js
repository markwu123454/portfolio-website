const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Secret path — not linked anywhere, only loadable once per server lifetime
const SECRET_PATH = '/a6wgWYLxJr6g-nifUqHoaOlnn_eyny0Y';
let secretConsumed = false;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url || '/', true);

            if (parsedUrl.pathname === SECRET_PATH) {
                if (secretConsumed) {
                    // Destroy the socket with no response — browser gets ERR_CONNECTION_RESET
                    req.socket.destroy();
                    return;
                }
                secretConsumed = true;
            }

            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    }).listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});