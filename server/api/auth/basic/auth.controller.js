import passport from 'passport';

import JWTTokenAuth from './jwt-token-auth';

import { BaseController } from '../../base.controller';
import { UserModel } from '../../user/user.model';

import ValidationError from '../../validation.error';
import { VALIDATION_MESSAGES } from '../auth.constants';

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

export default class AuthController extends BaseController {
    authenticateUser(req, res) {
	logger.info('---------------AuthController.authenticateUser---------------');
	try {
	    validators.isAuthHeaderAvailable(req);
	} catch(err) {
	    res.status(400).json({ errors: { name: err.name, message: err.message } });
	}
    }
}

