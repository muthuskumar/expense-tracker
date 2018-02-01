import http from 'http';
import express from 'express';

import { logger } from './config/app-logger';


var app = express();
var server = http.createServer(app);

server.listen(3000, () => {
    logger.info('App is running on localhost:3000');
});

exports = module.exports = app;
