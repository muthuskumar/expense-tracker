import passport from 'passport';

import { logger } from '../../../config/app-logger';

export default class AuthMiddleware {
    verifyTokenOnlyForSecurePaths(unsecurePaths) {
	logger.info('---------------AuthMiddleware.verifyUserOnlyForSecurePaths---------------');
	
	return (req, res, next) => {
	    logger.debug('Req path: ', req.path);
	    logger.debug('Headers: ',req.headers);
	    logger.debug('Paths which do not need security authorization: ', unsecurePaths);

	    var isUnsecureRoute = false;
	    unsecurePaths.forEach((item, index) => { // eslint-disable-line no-unused-vars
		if (item.path === req.path && item.method === req.method)
		    isUnsecureRoute = true;
	    });

	    logger.debug('Is unsecure route: ', isUnsecureRoute);
	    if (isUnsecureRoute)
		next();
	    else
		passport.authenticate('jwt', { session: false, failWithError: true })(req, res, next);
	};
    }
}

