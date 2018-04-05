import jwt from 'jsonwebtoken';
import config from '../../../config/environment';

import { logger } from '../../../config/app-logger';

var _options = {
    expiresIn: '5h'
};

export default class JWTTokenAuth {
    
    signUserId(userId) {
	logger.debug('---------------signUserId---------------');

	var token;

	logger.debug('UserId: ', userId);
	if (config.jwtSecretKey)
	    logger.debug('Secret available' );
	logger.debug('Options: ', _options);
	
	if (!userId) {
	    return { error: 'Error: UserId is not provided.', token: null }
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

    verifyUserId(token) {
	logger.debug('---------------verifyUserId---------------');

	var decoded;

	logger.debug('Token: ', token);
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
