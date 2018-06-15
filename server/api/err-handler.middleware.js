import InternalServerError from "./internal-server.error";

import AuthError from "./auth.error";
import ValidationError from "./validation.error";

import { AUTH_ERR_MESSAGES } from './auth/auth.constants';

import { logger } from '../config/app-logger';

/* Possible error names from various thirdparty libraries.*/
var authErrNames = [AUTH_ERR_MESSAGES.PASSPORT_AUTH_ERR_NAME];

export default function errorHandlerMiddleware(err, req, res, next) {
    logger.info('---------------errorHandlerMiddleware---------------');

    logger.debug('Error: ' + err.name);

    if (res.headersSent) {
        logger.debug('Headers already sent. Passing to default error handler');
        return next(err);
    }

    if (err instanceof ValidationError)
        res.status(400);
    else if (err instanceof AuthError || authErrNames.includes(err.name))
        res.status(401);
    else if (err instanceof InternalServerError)
        res.status(500);
    else
        res.status(500);

    return res.json({ errors: { name: err.name, message: err.message } });

}

