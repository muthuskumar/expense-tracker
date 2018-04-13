import JWTTokenAuth from './jwt-token-auth';

import { VALIDATION_MESSAGES } from './auth.constants';
import { logger } from '../../../config/app-logger';

var jwt = new JWTTokenAuth();

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
	logger.debug('Req headers: ', req.headers['authorization']);

	if (req.headers['authorization'] && req.headers['authorization'].includes('JWT '))
	    var token = req.headers['authorization'].replace(/JWT /, "");
	else {
	    logger.debug(VALIDATION_MESSAGES.TOKEN_UNAVAILABLE);
	    res.status(401).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER, message: VALIDATION_MESSAGES.TOKEN_UNAVAILABLE } });
	}
	
	var tokenResult = jwt.verifyToken(token);
	logger.debug('Token Result: ', tokenResult);
	
	if (tokenResult.userId)
	    req.userId = tokenResult.userId;
	else {
	    if (tokenResult.error) {
		if (tokenResult.error.message)
		    res.status(401).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER, message: tokenResult.error.message } });
		else
		    res.status(401).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER, message: tokenResult.error } });
	    }
	}

	next();
    }
}

