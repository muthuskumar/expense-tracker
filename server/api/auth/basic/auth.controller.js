import auth from 'basic-auth';

import JWTTokenAuth from './jwt-token-auth';

import { BaseController } from '../../base.controller';
import { UserModel } from '../../user/user.model';

import { VALIDATION_MESSAGES } from './auth.constants';
import { logger } from '../../../config/app-logger';

var jwt = new JWTTokenAuth();

export default class AuthController extends BaseController {
    authenticateUser(req, res) {
	logger.info('---------------AuthController.authenticateUser---------------');
	logger.debug('Req headers: ', req.headers['authorization']);

	if (!req.headers['authorization'])
	    res.status(401).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER, message: VALIDATION_MESSAGES.AUTH_DETAILS_NOT_PROVIDED } });
	
	var userCreds = auth(req);
	if (userCreds)
	    logger.debug('User creds obtained');
	else
	    res.status(401).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER, message: VALIDATION_MESSAGES.AUTH_DETAILS_INVALID } });

	UserModel.find({ username: userCreds.name, password: userCreds.pass })
	    .exec()
	    .then((users) => {
		logger.debug('Users:', users);

		if (users && users.length == 1) {
		    var tokenResult = jwt.signUserId(users[0]._id);

		    if(tokenResult.error)
			res.status(500).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_INTERNAL_SERVER, message: tokenResult.error } });

		    res.status(200).json({ token: tokenResult.token });
		}

		res.status(401).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER, message: VALIDATION_MESSAGES.AUTH_FAILED } });
	    })
	    .catch((err) => {
		logger.error('An error occurred while processing request: ', err);
		res.status(500).json({ errors: {name: VALIDATION_MESSAGES.ERROR_TYPE_INTERNAL_SERVER, message: err } });
	    });
    }

    verifyUser(req, res, next) {
	logger.info('---------------AuthController.verifyUser---------------');
	logger.debug('Req headers: ', req.headers['authorization']);

	if (req.headers['authorization'] && req.headers['authorization'].includes('JWT '))
	    var token = req.headers['authorization'].replace(/JWT /, "");
	else {
	    logger.debug(VALIDATION_MESSAGES.TOKEN_UNAVAILABLE);
	    res.status(401).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER, message: VALIDATION_MESSAGES.TOKEN_UNAVAILABLE } });
	}
	
	var tokenResult = jwt.verifyToken(token);
	logger.debug('Token Result: ', tokenResult);
	
	if (tokenResult.userId)
	    req.userId = tokenResult.userId;
	else {
	    if (tokenResult.error) {
		if (tokenResult.error.message)
		    res.status(401).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER, message: tokenResult.error.message } });
		else
		    res.status(401).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER, message: tokenResult.error } });
	    }
	}
	
	next();
    }
}
