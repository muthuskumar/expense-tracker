import auth from 'basic-auth';

import { BaseController } from '../../base.controller';
import { UserModel } from '../../user/user.model';
import JWTAuthToken from './jwt-token-auth';

import { VALIDATION_MESSAGES } from './auth.constants';
import { logger } from '../../../config/app-logger';

var jwt = new JWTAuthToken();

function _isUserAvailableInRequest(req) {
    logger.info('---------------_isUserAvailableInRequest---------------');
    
    return new Promise((resolve, reject) => {
	if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
	    logger.debug('Empty req.body');
	    
	    reject({ name: 'Internal Server Error', message: 'User details is not provided.'});
	} else {
	    logger.debug('req.body available');
	    
	    resolve(true);
	}
    });
}

export default class AuthController extends BaseController {

    registerUser(req, res) {
	logger.info('---------------AuthController.registerUser---------------');
	logger.debug('Req body: ', req.body);
	
	return _isUserAvailableInRequest(req)
	    .then((isAvailable) => {
		var user = new UserModel(req.body);
		user.save(req.body)
		    .then((user) => {
			var tokenResult = jwt.signUserId(user._id);

			if(tokenResult.error)
			    res.status(500).json({ auth: false, err: tokenResult.error, token: null});
			res.status(201).json({ auth: true, err: null, token: tokenResult.token });
		    })
		    .catch(super.handleError(res));
	    })
	    .catch(super.handleError(res));
    }

    authenticateUser(req, res) {
	logger.info('---------------AuthController.authenticateUser---------------');
	logger.debug('Req headers: ', req.headers['authorization']);

	var userCreds = auth(req);
	if (userCreds)
	    logger.debug('User creds obtained');
	
	if (!userCreds)
	    res.status(401).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER, message: VALIDATION_MESSAGES.AUTH_DETAILS_INVALID } });

	UserModel.find({ username: userCreds.name, password: userCreds.pass })
	    .exec()
	    .then((users) => {
		logger.debug(users);

		if (users && users.length == 1) {
		    var tokenResult = jwt.signUserId(users[0]._id);

		    if(tokenResult.error)
			res.status(500).json({ err: tokenResult.error });
		    res.status(200).json({ token: tokenResult.token });
		}

		res.status(401).json({ errors: { name: VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHRORIZED_USER, message: VALIDATION_MESSAGES.AUTH_FAILED } });
	    })
	    .catch((err) => {
		res.status(500).send(err);
	    });
    }
}
