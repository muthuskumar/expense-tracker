import AuthController from './auth.controller';

import { VALIDATION_MESSAGES } from '../auth.constants';
import { logger } from '../../../config/app-logger';

export default class AuthMiddleware {
	verifyTokenOnlyForSecurePaths(unsecurePaths) {
		logger.info('---------------AuthMiddleware.verifyUserOnlyForSecurePaths---------------');
		return (req, res, next) => {
			logger.debug('Req path: ', req.path);
			logger.debug('Paths which do not need security authorization: ', unsecurePaths);

			var isUnsecureRoute = false;
			unsecurePaths.forEach((item, index) => {
				if (item.path === req.path && item.method === req.method)
					isUnsecureRoute = true;
			});

			logger.debug('Is unsecure route: ', isUnsecureRoute);
			if (isUnsecureRoute)
				next();
			else
				this.verifyToken(req, res, next);
		}
	}

	verifyToken(req, res, next) {
		logger.info('---------------AuthMiddelware.verifyUser---------------');

		var authCtrl = new AuthController();
		authCtrl.authenticateUser(req, res, next);
		
		next();
	}
}

