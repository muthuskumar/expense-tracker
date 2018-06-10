import express from 'express';
import mongoose from 'mongoose';
import bluebird from 'bluebird';

import { logger } from './config/app-logger';
import ExpressConfig from './config/express';
import config from './config/environment';
import registerRoutes from './routes';

import "./api/auth/strategies";

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
registerRoutes(app);

exports = module.exports = app;
