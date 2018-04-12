import jwt from 'jsonwebtoken';

import { VALIDATION_MESSAGES } from './auth.constants';
import config from '../../../config/environment';

import { logger } from '../../../config/app-logger';

var _options = {
    expiresIn: '5h'
};

export default class JWTTokenAuth {
    
    signUserId(userId) {
	logger.info('---------------signUserId---------------');

	var token;


	if (config.jwtSecretKey)
	    logger.debug('Secret available' );
	else
	    return { error: VALIDATION_MESSAGES.JWT_SECRET_UNAVAILABLE, token: null }
	
	logger.debug('UserId: ', userId);	
	if (!userId) {
	    return { error: VALIDATION_MESSAGES.USERID_UNAVAILABLE, token: null }
	}

	try {
	    token = jwt.sign({ userId: userId }, config.jwtSecretKey, _options);

	    logger.debug('Token generated: ', token);
	    
	    return { error: null, token: token };
	} catch(err) {
	    logger.error('Error while generating token - ', err);
	    return { error: err, token: token };
	}
    }

    verifyToken(token) {
	logger.info('---------------verifyToken---------------');

	var decoded;

	logger.debug('Token: ', token);

	if (!token)
	    return { error: VALIDATION_MESSAGES.TOKEN_UNAVAILABLE, token: null }
	
	if (config.jwtSecretKey)
	    logger.debug('Secret key available');

	try {
	    decoded = jwt.verify(token, config.jwtSecretKey);
	    logger.debug('Token verification result: ', decoded);
	    
	    return { error: null, userId: decoded.userId};
	} catch(err) {
	    logger.error('Error while decoding token - ', err);
	    return { error: err, userId: null };
	}
    }
}
