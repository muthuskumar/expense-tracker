import express from 'express';
import mongoose from 'mongoose';
import bluebird from 'bluebird';

import { logger } from './config/app-logger';
import ExpressConfig from './config/express';
import config from './config/environment';
import registerRoutes from './routes';

import AuthMiddleware from './api/auth/basic/auth.middleware';

mongoose.Promise = bluebird;
mongoose.connect(config.mongo.uri, config.mongo.options)
    .then(() => {
	logger.info("Database connection established!");
    })
    .catch((err) => {
	logger.error("An error occured while starting the database.", err);
    });

var app = express();

new ExpressConfig(app);

const unsecureRoutes = [
    { path: '/api/users', method: 'POST' },
    { path: '/api/session', method: 'POST' }
];
var authMiddleware = new AuthMiddleware();
app.use(authMiddleware.verifyTokenOnlyForSecurePaths(unsecureRoutes));

registerRoutes(app);

exports = module.exports = app;

