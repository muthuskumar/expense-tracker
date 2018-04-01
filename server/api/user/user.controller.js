import mongoose from 'mongoose';

import { BaseController } from '../base.controller';
import { UserModel } from './user.model';
import { emailFormatValidationRegex } from '../../utils/custom.validators';

import { logger } from '../../config/app-logger';

function _isUserIdAvailableInRequest(req) {
    logger.debug('---------------_isUserIdAvailableInRequest---------------');

    return new Promise((resolve, reject) => {
	if (req.params.id) {
	    logger.debug('id available');
	    
	    resolve(true)
	} else {
	    logger.debug('id unavailable');
	    
	    reject({ name: 'Internal Server Error', message: 'UserId is not provided.'});
	}
    });
}

function _isUserAvailableInRequest(req) {
    logger.debug('---------------_isUserAvailableInRequest---------------');
    
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

function _stripUniqueIdsBeforeUpdate(req) {
    logger.debug('---------------_stripUniqueIdsBeforeUpdate---------------');

    if (req.body._id)
	Reflect.deleteProperty(req.body, '_id');

    if (req.body.username)
	Reflect.deleteProperty(req.body, 'username');

    if (req.body.email)
	Reflect.deleteProperty(req.body, 'email');

    logger.debug('Request body after removal: ', req.body);
}

export default class UserController extends BaseController {
    
    getUsers(req, res) {
	logger.debug('---------------UserController.getUsers---------------');
	logger.debug('Query params: ', req.query);
	
	var searchCriteria = req.query || {};
	logger.debug('Search Criteria: ', searchCriteria);

	return UserModel.find(searchCriteria)
	    .sort({ _id: 'asc'})
	    .exec()
	    .then(super.respondWithResult(res))
	    .catch(super.handleError(res));
    }

    getUser(req, res) {
	logger.debug('---------------UserController.getUser---------------');
	logger.debug('Req params: ', req.params);

	var searchCriteria = {}
	try {
	    mongoose.Types.ObjectId(req.params.id);
	    searchCriteria = { _id: req.params.id};
	} catch(err) {
	    logger.info('Received parameter id is not user id');

	    if (emailFormatValidationRegex.test(req.params.id))
		searchCriteria = { email: req.params.id }
	    else
		searchCriteria = { username: req.params.id }
	}
	    
	return _isUserIdAvailableInRequest(req)
	    .then((isAvailable) => {
		UserModel.findOne(searchCriteria)
		    .exec()
		    .then(super.handleEntityNotFound(res))
		    .then(super.respondWithResult(res))
		    .catch(super.handleError(res));
	    })
	    .catch(super.handleError(res));
    }

    createUser(req, res) {
	logger.debug('---------------UserController.createUser---------------');
	logger.debug('Req body: ', req.body);
	
	return _isUserAvailableInRequest(req)
	    .then((isAvailable) => {
		var user = new UserModel(req.body);
		user.save(req.body)
		    .then(super.respondWithResult(res, 201))
		    .catch(super.handleError(res));
	    })
	    .catch(super.handleError(res));
    }

    updateUser(req, res) {
	logger.debug('---------------UserController.updateUser---------------');
	logger.debug('Req params: ', req.params);
	logger.debug('Req body', req.body);
	
	return Promise.all([ _isUserIdAvailableInRequest(req), _isUserAvailableInRequest(req) ])
	    .then((areAvailable) => {
		logger.debug('req params available: ', areAvailable[0]);
		logger.debug('req body available: ', areAvailable[1]);
		
		if (areAvailable[0] && areAvailable[1]) {
		    _stripUniqueIdsBeforeUpdate(req);

		    UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
			.exec()
			.then(super.handleEntityNotFound(res))
			.then(super.respondWithResult(res))
			.catch(super.handleError(res));
		}
	    })
	    .catch(super.handleError(res));
    }

    removeUser(req, res) {
	logger.debug('---------------UserController.removeUser---------------');
	logger.debug('Req params: ', req.params);
	
	return _isUserIdAvailableInRequest(req)
	    .then((isAvailable) => {
		UserModel.findByIdAndRemove(req.params.id).exec()
		    .then(super.handleEntityNotFound(res))
		    .then(super.respondWithResult(res, 204))
		    .catch(super.handleError(res));
	    })
	    .catch(super.handleError(res));
    }
}
