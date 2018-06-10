import ValidationError from "./validation.error";
import AuthError from "./auth.error";

import { logger } from '../config/app-logger';
import InternalServerError from "./internal-server.error";

/* Possible error names from various thirdparty libraries.*/
var authErrNames = ['AuthenticationError'];

export default function errorHandlerMiddleware(err, req, res, next) {
    logger.info('---------------errorHandlerMiddleware---------------');

    logger.debug('Error: ' + err.name);

    if (err instanceof ValidationError)
        res.status(400);
    else if (err instanceof AuthError || authErrNames.includes(err.name))
        res.status(401);
    else if (err instanceof InternalServerError)
        res.status(500);
    else
        res.status(500);

    res.json({ errors: { name: err.name, message: err.message } });

};
