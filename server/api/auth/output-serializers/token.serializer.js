import JWTTokenAuth from '../util/jwt-token-util';
import { logger } from '../../../config/app-logger';

export default function tokenSerializer(user, res) {
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