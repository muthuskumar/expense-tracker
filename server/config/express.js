import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import methodOverride from 'method-override';
import errorHandler from 'errorhandler';

import { logger } from './app-logger';

class Express {
    constructor(app) {
	const env = app.get('env');
	
	app.use(compression());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(methodOverride());
	app.use(cookieParser());

	if (env === 'development' || env === 'test') {
	    app.use(errorHandler((err, msg, req) => {
		logger.error(err, 'An error occurred while processing %s in %s', req.method, req.url);
	    }));
	}
    }
}

module.exports = Express;
