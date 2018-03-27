import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import bluebird from 'bluebird';

import { logger } from './config/app-logger';
import ExpressConfig from './config/express';
import config from './config/environment';
import registerRoutes from './routes';

mongoose.Promise = bluebird;
mongoose.connect(config.mongo.uri, config.mongo.options)
    .then(() => {
	logger.info("Database connection established!");
    })
    .catch((err) => {
	logger.error("An error occured while starting the database.", err);
    });

var app = express();
var server = http.createServer(app);

new ExpressConfig(app);
registerRoutes(app);

server.listen(3000, () => {
    logger.info('App is running on localhost:3000');
});

exports = module.exports = app;
