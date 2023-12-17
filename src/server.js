const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(
    '/b92',
    createProxyMiddleware({
        target: 'https://www.b92.net',
        changeOrigin: true,
        pathRewrite: {
            '^/b92': '',
        },
    })
);

// A standard non-reserved port number used for web and application servers.
app.listen(8080, function () {
    console.log('CORS-enabled web server listening on port 8080.')
});