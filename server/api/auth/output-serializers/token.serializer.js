import JWTTokenAuth from '../util/jwt-token-util';
import { BaseController } from '../../base.controller';

import { logger } from '../../../config/app-logger';

var baseController = new BaseController();

export default function tokenSerializer(user, req, res) {
    logger.info('---------------AuthController.reqLoginCb---------------');
    
    const jwtTokenAuth = new JWTTokenAuth();
    const tokenResult = jwtTokenAuth.signUserId(user._id);

    tokenResult
    .then(baseController.respondWithResult(res, 201))
    .catch(baseController.handleErrorAsync(res));
        /* .then((token) => {
            return res.status(201).json({ token: token });
        })
        .catch((err) => {
            return res.status(400).json({ errors: { name: err.name, message: err.message } });
        }); */
};
