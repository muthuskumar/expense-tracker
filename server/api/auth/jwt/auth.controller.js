import passport from 'passport';

import PassportBaseController from '../passport-base.controller';
import userIdSerializer from '../output-serializers/userId.serializer';

import ValidationError from '../../validation.error';
import { VALIDATION_MESSAGES, AUTH_ERR_MESSAGES } from '../auth.constants';

import { logger } from '../../../config/app-logger';

const validators = {
    isAuthHeaderAvailable: (req) => {
        logger.info('---------------isAuthHeaderAvailable---------------');

        if (!req.headers['authorization'])
            throw new ValidationError('auth header', VALIDATION_MESSAGES.AUTH_HEADER_UNAVAILABLE);

        logger.debug('Req headers: ', req.headers['authorization']);
    }
};

export default class AuthController extends PassportBaseController{
    authenticateUser(req, res, next) {
        logger.info('---------------AuthController.authenticateUser---------------');

        try {
            validators.isAuthHeaderAvailable(req);

            passport.authenticate('jwt', { session: false }, super.passportAuthenticateCb(req, res, next, userIdSerializer))(req, res);
            
        } catch (err) {
            logger.error('Error: ', err);
            super.handleErrorSync(err, res, super.getStatusCodeForError(err));
            next(err);
        }
    }
}