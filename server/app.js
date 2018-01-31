import express from 'express';
import http from 'http';

import config from './config/environment';

var app = express();
var server = http.createServer(app);

server.listen(3000, () => {
    console.log('App is running on localhost:3000'); // eslint-disable-line no-console
});

exports = module.exports = app;
