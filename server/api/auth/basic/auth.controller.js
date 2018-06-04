import passport from 'passport';

import JWTTokenAuth from './jwt-token-auth';
import { BaseController } from '../../base.controller';
import { UserModel } from '../../user/user.model';

import AuthError from '../../auth.error';
import ValidationError from '../../validation.error';
import { VALIDATION_MESSAGES, AUTH_ERR_MESSAGES } from '../auth.constants';

import { logger } from '../../../config/app-logger';

var jwt = new JWTTokenAuth();

const validators = {
    isAuthHeaderAvailable: (req) => {
	logger.info('---------------isAuthHeaderAvailable---------------');	

	if (!req.headers['authorization'])
	    throw new ValidationError('auth header', VALIDATION_MESSAGES.BASIC_AUTH_DETAILS_UNAVAILABLE);

	logger.debug('Req headers: ', req.headers['authorization']);
    }
};

var authCtrl;

export default class AuthController {
    constructor() {
	authCtrl = this;
    }
    
    authenticateUser(req, res) {
	logger.info('---------------AuthController.authenticateUser---------------');

	try {
	    validators.isAuthHeaderAvailable(req);

	    passport.authenticate('basic', { session: false }, authCtrl.passportAuthenticateCb(req, res))(req, res);

	} catch(err) {
	    logger.error('Error: ', err);
	    res.status(400).json({ errors: { name: err.name, message: err.message } });
	}

    }

    passportAuthenticateCb(req, res) {
	logger.info('---------------AuthController.passportAuthenticateCb---------------');

	return function (err, user, info) {
	    try {
		if (err)
		    throw err;

		if (!user) 
		    throw new AuthError(AUTH_ERR_MESSAGES.AUTH_FAILED);
		
		req.login(user, { session: false }, authCtrl.reqLoginCb(user, res));

	    } catch(err) {
		logger.error('Error: ', err);
		res.status(401).json({ errors: { name: err.name, message: err.message } });
	    }

	}
    }

    reqLoginCb(user, res) {
	logger.info('---------------AuthController.reqLoginCb---------------');
	
	return (err) => {
	    if (err) {
		return res.status(400).json({ errors: { name: err.name, message: err.message } });
	    }
	    
	    const jwtTokenAuth = new JWTTokenAuth();
	    const tokenResult = jwtTokenAuth.signUserId(user._id);

	    tokenResult
		.then((token) => {
		    return res.status(201).json({ token: token });
		})
		.catch((err) => {
		    return res.status(400).json({ errors: { name: err.name, message: err.message } });
		});
	};
    }    
}

