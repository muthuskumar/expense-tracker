import JWTTokenAuth from '../util/jwt-token.util';
import { BaseController } from '../../base.controller';

import ValidationError from '../../validation.error';
import { VALIDATION_MESSAGES } from '../auth.constants';

import { logger } from '../../../config/app-logger';

var validators = {
    isUserAvailableInReq: function (req) {
        logger.info('---------------isUserAvailableInReq---------------');

        if (!req.user) {
            logger.debug('User not available in req');
            throw new ValidationError('user', VALIDATION_MESSAGES.REQ_USER_UNAVAILABLE);
        }
    }
};
export default class UserIdTokenSerializer extends BaseController {
    middlewareFn(req, res, next) {
        logger.info('---------------tokenSerializer---------------');

        try {
            validators.isUserAvailableInReq(req);
        } catch (err) {
            logger.error('Error: ', err);
            next(err);
            return;
        }
        const jwtTokenAuth = new JWTTokenAuth();
        const tokenResult = jwtTokenAuth.signUserId(req.user._id);

        tokenResult
            .then(super.respondWithResult(res, 201))
            .catch(super.callErrorMiddleware(next));
    }
}
