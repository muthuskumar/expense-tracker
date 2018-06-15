/*global Promise, Reflect */
import mongoose from 'mongoose';

import { BaseController } from '../base.controller';
import { UserModel } from './user.model';
import { emailFormatValidationRegex } from '../../utils/custom.validators';

import ValidationError from '../validation.error';
import { VALIDATION_MESSAGES } from './user.constants';

import { logger } from '../../config/app-logger';

function _isUserIdAvailableInRequest(req) {
    logger.info('---------------_isUserIdAvailableInRequest---------------');

    if (req.params.id) {
	logger.debug('id available');
    } else {

	logger.debug('id unavailable');
	throw new ValidationError('userId', VALIDATION_MESSAGES.USERID_UNAVAILABLE);
    }
}

function _isUserAvailableInRequest(req) {
    logger.info('---------------_isUserAvailableInRequest---------------');

    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {

	logger.debug('Empty req.body');
	throw new ValidationError('headers',VALIDATION_MESSAGES.USERDETAILS_UNAVAILABLE);
    } else {
	logger.debug('req.body available');
    }
}

function _stripUniqueIdsBeforeUpdate(req) {
    logger.info('---------------_stripUniqueIdsBeforeUpdate---------------');

    if (req.body._id)
	Reflect.deleteProperty(req.body, '_id');

    if (req.body.username)
	Reflect.deleteProperty(req.body, 'username');

    if (req.body.email)
	Reflect.deleteProperty(req.body, 'email');

    logger.debug('Request body after removal: ', req.body);
}

export default class UserController extends BaseController {

    getUsers(req, res, next) {
	logger.info('---------------UserController.getUsers---------------');
	logger.debug('Query params: ', req.query);

	var searchCriteria = req.query || {};
	logger.debug('Search Criteria: ', searchCriteria);

	return UserModel.find(searchCriteria)
	    .sort({ _id: 'asc' })
	    .exec()
	    .then(super.respondWithResult(res))
	    .catch(super.callErrorMiddleware(next));
    }

    getUser(req, res, next) {
	logger.info('---------------UserController.getUser---------------');
	logger.debug('Req params: ', req.params);

	var searchCriteria = {};
	try {
	    _isUserIdAvailableInRequest(req);
	} catch (err) {
	    next(err);
	    return;
	}
	
	try {
	    mongoose.Types.ObjectId(req.params.id);
	    searchCriteria = { _id: req.params.id };
	} catch (err) {
	    logger.info('Received parameter id is not user id');

	    if (emailFormatValidationRegex.test(req.params.id))
		searchCriteria = { email: req.params.id };
	    else
		searchCriteria = { username: req.params.id };
	}

	UserModel.findOne(searchCriteria)
	    .exec()
	    .then(super.handleEntityNotFound(res))
	    .then(super.respondWithResult(res))
	    .catch(super.callErrorMiddleware(next));

    }

    createUser(req, res, next) {
	logger.info('---------------UserController.createUser---------------');
	logger.debug('Req body: ', req.body);

	try {
	    _isUserAvailableInRequest(req);
	} catch (err) {
	    next(err);
	    return;
	}

	var user = new UserModel(req.body);
	user.save(req.body)
	    .then(super.respondWithResult(res, 201))
	    .catch(super.callErrorMiddleware(next));

    }

    updateUser(req, res, next) {
	logger.info('---------------UserController.updateUser---------------');
	logger.debug('Req params: ', req.params);
	logger.debug('Req body', req.body);

	try{
	    _isUserIdAvailableInRequest(req);
	    _isUserAvailableInRequest(req);
	} catch (err) {
	    next(err);
	    return;
	}

	_stripUniqueIdsBeforeUpdate(req);
	UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
	    .exec()
	    .then(super.handleEntityNotFound(res))
	    .then(super.respondWithResult(res))
	    .catch(super.callErrorMiddleware(next));
    }

    removeUser(req, res, next) {
	logger.info('---------------UserController.removeUser---------------');
	logger.debug('Req params: ', req.params);

	try {
	    _isUserIdAvailableInRequest(req);
	} catch (err) {
	    next(err);
	    return;
	}

	UserModel.findByIdAndRemove(req.params.id).exec()
	    .then(super.handleEntityNotFound(res))
	    .then(super.respondWithResult(res, 204))
	    .catch(super.callErrorMiddleware(next));
    }
}

