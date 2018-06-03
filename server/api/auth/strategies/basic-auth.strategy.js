import { UserModel } from '../../user/user.model';

import { VALIDATION_MESSAGES, AUTH_ERR_MESSAGES } from '../auth.constants';
import ValidationError from '../../validation.error';
import AuthorizationError from '../../auth.error';

import { logger } from '../../../config/app-logger';

var validators = {
    isUsernameAvailable(username) {
	logger.info('---------------isUsernameAvailable---------------');

	if (!username) {
	    throw new ValidationError('username', VALIDATION_MESSAGES.USERNAME_UNAVAILABLE);
	}

	logger.debug('Username available');
    },

    isPasswordAvailable(password) {
	logger.info('---------------isPasswordAvailable---------------');

	if (!password) {
	    throw new ValidationError('password', VALIDATION_MESSAGES.PASSWORD_UNAVAILABLE);
	}

	logger.debug('Password available');
    }
};

module.exports.basicAuthStrategy = function (username, password, done) {
    logger.info('---------------basicAuthStrategy---------------');
    
    try {
	validators.isUsernameAvailable(username);
	validators.isPasswordAvailable(password);
    } catch(err) {
	done(err, null);
    }
    
    UserModel.findOne({ username: username }).exec()
	.then((user) => {
	    if (!user)
		return done(new AuthorizationError(AUTH_ERR_MESSAGES.USER_NOT_FOUND), null);

	    if (!user.authenticate(password))
		return done(new AuthorizationError(AUTH_ERR_MESSAGES.INVALID_PASSWORD), null);

	    return done(null, user);
	})
	.catch((err) => {
	    done(err, null);
	});
};

