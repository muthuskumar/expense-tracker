import JWTTokenAuth from '../util/jwt-token-util';
import { BaseController } from '../../base.controller';

import { logger } from '../../../config/app-logger';

var baseController = new BaseController();

export default function tokenSerializer(user, req, res) {
    logger.info('---------------tokenSerializer---------------');

    const jwtTokenAuth = new JWTTokenAuth();
    const tokenResult = jwtTokenAuth.signUserId(user._id);

    tokenResult
        .then(baseController.respondWithResult(res, 201))
        .catch(baseController.handleErrorAsync(res));
};
