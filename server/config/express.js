import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import methodOverride from 'method-override';
import AuthMiddleware from '../api/auth/jwt';

import { logger } from './app-logger';

class Express {
	constructor(app) {
		const env = app.get('env');

		app.use(compression());
		app.use(bodyParser.urlencoded({ extended: false }));
		app.use(bodyParser.json());
		app.use(methodOverride());
		app.use(cookieParser());

		const unsecureRoutes = [
			{ path: '/api/users', method: 'POST' },
			{ path: '/api/session', method: 'POST' }
		];
		var authMiddleware = new AuthMiddleware();
		app.use(authMiddleware.verifyTokenOnlyForSecurePaths(unsecureRoutes));
	}
}

module.exports = Express;
