'use strict';

/*eslint no-process-env:0*/

const env = process.env.NODE_ENV || 'development';

if (env === "development" || env === "test") {
    require('babel-register')
}

exports = module.exports = require('./server');

