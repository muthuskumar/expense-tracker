'use strict';
/*eslint no-process-env:0*/

import path from 'path';
import bunyan from 'bunyan';

// Development specific configuration
// ==================================
module.exports = {
    // MongoDB connection options
    mongo: {
	uri: 'mongodb://localhost:27017/expense-tracker-dev',
	options: {
	    reconnectTries: 10,
	    reconnectInterval: 5000,
	    poolSize: 10
	}
    },

    // Seed database on startup
    seedDB: false,

    loggerConfig: {
	level: bunyan.DEBUG,
	streams: [
	    {
		level: 'debug',
		path: path.join(path.normalize(`${__dirname}/../../..`), 'serveroutput-debug.log')
	    },
	    {
		level: 'error',
		path: path.join(path.normalize(`${__dirname}/../../..`), 'serveroutput-error.log')
	    } 
	]
    },

    jwtSecretKey: process.env.JWT_SECRET_KEY || 'expense-tracker-secret-key'
};

