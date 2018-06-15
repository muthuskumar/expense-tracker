/*global Promise*/
import jwt from 'jsonwebtoken';

import config from '../../../config/environment';
import { VALIDATION_MESSAGES } from '../auth.constants';
import ValidationError from '../../validation.error';

import { logger } from '../../../config/app-logger';
import InternalServerError from '../../internal-server.error';

var _options = {
    expiresIn: '5h'
};

const validators = {
    isSecretAvailable(secret) {
	logger.info('---------------isSecretAvailable---------------');

	if (!secret) {
	    throw new ValidationError('secret', VALIDATION_MESSAGES.JWT_SECRET_UNAVAILABLE);
	}

	logger.debug('Secret available');
    },

    isUserIdAvailable(userId) {
	logger.info('---------------isUserIdAvailable---------------');

	if (!userId) {
	    throw new ValidationError('userId', VALIDATION_MESSAGES.USERID_UNAVAILABLE);
	}

	logger.debug('UserId: ', userId);
    },

    isTokenAvailable(token) {
	logger.info('---------------isTokenAvailable---------------');

	if (!token) {
	    throw new ValidationError('token', VALIDATION_MESSAGES.TOKEN_UNAVAILABLE);
	}

	logger.debug('Token available');
    }
};

export default class JWTTokenAuth {

    signUserId(userId) {
	logger.info('---------------signUserId---------------');

	var token;
	var error;

	try {
	    validators.isSecretAvailable(config.jwtSecretKey);
	    validators.isUserIdAvailable(userId);

	    token = jwt.sign({ userId: userId }, config.jwtSecretKey, _options);
	} catch (err) {
	    logger.error(err);
	    error = err;
	}

	return new Promise(function (resolve, reject) {
	    if (token)
		resolve(token)
	    else if (error)
		reject(error)
	    else
		reject();
	});
    }

    verifyToken(token) {
	logger.info('---------------verifyToken---------------');

	var decoded;
	var error;

	try {
	    validators.isTokenAvailable(token);
	    validators.isSecretAvailable(config.jwtSecretKey);

	    decoded = jwt.verify(token, config.jwtSecretKey);
	    logger.debug('Token verification result: ', decoded);
	} catch (err) {
	    logger.error(err);
	    error = err;
	}

	return new Promise(function (resolve, reject) {
	    if (decoded)
		resolve(decoded.userId);
	    else if (error)
		reject(error);
	    else
		reject(new InternalServerError('An error occurred while processing token.'));
	});
    }
}

