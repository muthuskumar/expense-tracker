import { BaseController } from '../base.controller';
import { UserModel } from './user.model';

import { logger } from '../../config/app-logger';

function _isUserIdAvailableInRequest(req) {
    logger.debug('---------------_isUserIdAvailableInRequest---------------');

    return new Promise((resolve, reject) => {
	logger.debug('request.params: ', req.params, 'Id: ', req.params.id);
	
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
	logger.debug('req.params: ', req.params);
	logger.debug('request.body', req.body);
	
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
	
	return _isUserIdAvailableInRequest(req)
	    .then((isAvailable) => {
		UserModel.findById(req.params.id)
		    .exec()
		    .then(super.handleEntityNotFound(res))
		    .then(super.respondWithResult(res))
		    .catch(super.handleError(res));
	    })
	    .catch(super.handleError(res));
    }

    createUser(req, res) {
	logger.debug('---------------UserController.createUser---------------');
	
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
