import passport from 'passport';

import tokenSerializer from '../output-serializers/token.serializer';
import PassportBaseController from '../passport-base.controller';

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

export default class AuthController extends PassportBaseController {
	authenticateUser(req, res) {
		logger.info('---------------AuthController.authenticateUser---------------');

		try {
			validators.isAuthHeaderAvailable(req);

			passport.authenticate('basic', { session: false }, super.passportAuthenticateCb(req, res, tokenSerializer))(req, res);

		} catch (err) {
			logger.error('Error: ', err);
			super.handleErrorSync(err, res, super.getStatusCodeForError(err));
		}
	}
}
