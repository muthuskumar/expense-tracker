import passport from 'passport';

import tokenSerializer from '../output-serializers/token.serializer';
import { PassportBaseController } from '../passport-base.controller';

import AuthError from '../../auth.error';
import ValidationError from '../../validation.error';
import { VALIDATION_MESSAGES, AUTH_ERR_MESSAGES } from '../auth.constants';

import { logger } from '../../../config/app-logger';

const validators = {
	isAuthHeaderAvailable: (req) => {
		logger.info('---------------isAuthHeaderAvailable---------------');

		if (!req.headers['authorization'])
			throw new ValidationError('auth header', VALIDATION_MESSAGES.BASIC_AUTH_DETAILS_UNAVAILABLE);

		logger.debug('Req headers: ', req.headers['authorization']);
	}
};

var authCtrl;

export default class AuthController extends PassportBaseController {
	constructor() {
		super();
		authCtrl = this;
	}

	authenticateUser(req, res) {
		logger.info('---------------AuthController.authenticateUser---------------');

		try {
			validators.isAuthHeaderAvailable(req);

			passport.authenticate('basic', { session: false }, super.passportAuthenticateCb(req, res, tokenSerializer))(req, res);

		} catch (err) {
			logger.error('Error: ', err);
			res.status(400).json({ errors: { name: err.name, message: err.message } });
		}

	}
}
