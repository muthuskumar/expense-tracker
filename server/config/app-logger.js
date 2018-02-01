import bunyan from 'bunyan';
import config from './environment';

var logger;

if (!logger) {
    logger = bunyan.createLogger(config.loggerConfig);
}

module.exports.logger = logger;
