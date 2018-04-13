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
	logger.debug('userCreds:', userCreds);	
	if (userCreds)
	    logger.debug('User creds obtained');
	else
	    res.status(401).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER, message: VALIDATION_MESSAGES.AUTH_DETAILS_INVALID } });

	UserModel.find({ username: userCreds.name })
	    .exec()
	    .then((users) => {
		logger.debug('Users:', users);

		if (users && users.length == 1) {
		    if (users[0].authenticate(userCreds.pass)) {
			logger.debug('Password matched.');
			var tokenResult = jwt.signUserId(users[0]._id);

			if(tokenResult.error)
			    res.status(500).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_INTERNAL_SERVER, message: tokenResult.error } });

			res.status(201).json({ token: tokenResult.token });
		    } else {
			res.status(401).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER, message: VALIDATION_MESSAGES.AUTH_FAILED } });
		    }
		} else {
		    res.status(401).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER, message: VALIDATION_MESSAGES.AUTH_FAILED } });
		}
	    })
	    .catch((err) => {
		logger.error('An error occurred while processing request: ', err);
		res.status(500).json({ errors: {name: VALIDATION_MESSAGES.ERROR_TYPE_INTERNAL_SERVER, message: err } });
	    });
    }
}

