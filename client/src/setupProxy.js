const { createProxyMiddleware } = require('http-proxy-middleware');


module.exports = function (app) {
    app.use(
        createProxyMiddleware({
            pathFilter: '/account/**',
            target: 'http://127.0.0.1:8001',
            secure: false,
            changeOrigin: true,
            logLevel: 'debug',
            pathRewrite: {
                '^/account': '/api/v1',
            },
        })
    );

    app.use(
        createProxyMiddleware({
            pathFilter: '/blogs/**',
            target: 'http://127.0.0.1:8000',
            secure: false,
            changeOrigin: true,
            logLevel: 'debug',
            pathRewrite: {
                '^/blogs': '/api/v1/blogs',
            },
        })
    );

    app.use(
        createProxyMiddleware({
            pathFilter: '/countries/**',
            target: 'https://restcountries.com',
            secure: false,
            changeOrigin: true,
            logLevel: 'debug',
            pathRewrite: {
                '^/countries': '/v2/all?fields=name',
            },
        })
    );

    app.use(
        createProxyMiddleware({
            pathFilter: '/monitor-api/**',
            target: 'http://127.0.0.1:8085',
            secure: false,
            changeOrigin: true,
            logLevel: 'debug',
            pathRewrite: {
                '^/monitor-api': '/api/v1',
            },
        })
    );
};
