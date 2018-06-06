import { BaseController } from '../base.controller';
import { AuthError } from '../auth.error';

export class PassportBaseController extends BaseController {
    passportAuthenticateCb(req, res, outputSerializer) {
        logger.info('---------------PassportBaseController.passportAuthenticateCb---------------');

        return function (err, user, info) {
            try {
                if (err)
                    throw err;

                if (!user)
                    throw new AuthError(AUTH_ERR_MESSAGES.AUTH_FAILED);

                req.login(user, { session: false }, outputSerializer(user, res));

            } catch (err) {
                logger.error('Error: ', err);
                super.handleErrorSync(err, res, super.getStatusCodeForError(err));
            }
        }
    }
}
