import http from 'http';
import mongoose from 'mongoose';

import app from './app';
import { logger } from './config/app-logger';

var server = http.createServer(app);

server.listen(3000, () => {
    logger.info('App is running on localhost:3000');
});

var closeConnections = () => {
    mongoose.connection.close(() => {
        logger.info('Closing mongoose connections on app termination.');
    });

    server.close(() => {
        logger.info('Closing server connections.');
    });

    setTimeout(() => {
        logger.error('Could not close connections. Forcing shut down.');
        process.exit(1);
    }, 30 * 1000);
};

process.on('SIGINT', closeConnections);
process.on('SIGTERM', closeConnections);
