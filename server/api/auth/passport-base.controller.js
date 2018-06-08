import { BaseController } from '../base.controller';

import AuthError from '../auth.error';
import ValidationError from '../validation.error';
import { VALIDATION_MESSAGES, AUTH_ERR_MESSAGES } from './auth.constants';

import { logger } from '../../config/app-logger';


export default class PassportBaseController extends BaseController {
    passportAuthenticateCb(req, res, next, outputSerializer) {
        logger.info('---------------PassportBaseController.passportAuthenticateCb---------------');

        var getStatusCodeForError = super.getStatusCodeForError;
        var handleErrorSync = super.handleErrorSync;

        return function (err, user, info) {
            try {
                logger.debug(info);
                
                if (err)
                    throw err;

                if (!user)
                    throw new AuthError(AUTH_ERR_MESSAGES.AUTH_FAILED);

                if (!outputSerializer)
                    throw new ValidationError('outputSerializer', VALIDATION_MESSAGES.SERIALIZER_UNAVAILABLE);

                outputSerializer(user, req, res);    
                next();
            } catch (err) {
                logger.error('Error: ', err);
                handleErrorSync(err, res, getStatusCodeForError(err));
                next(err);
            }
        }
    }
}
