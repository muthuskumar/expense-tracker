import { BaseController } from '../base.controller';
import { UserModel } from './user.model';

function _isUserIdAvailableInRequest(req) {
    return new Promise((resolve, reject) => {
	if (req.params.id) {
	    resolve(true)
	} else {
	    reject({ name: 'Internal Server Error', message: 'UserId is not provided.'});
	}
    });
}

function _isUserAvailableInRequest(req) {
    return new Promise((resolve, reject) => {
	if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
	    reject({ name: 'Internal Server Error', message: 'User details is not provided.'});
	} else {
	    console.log('User details are fine.');
	    resolve(true);
	}
    });
}

export class UserController extends BaseController {
    
    getUsers(req, res) {
	var searchCriteria = req.body || {};
	
	return UserModel.find(searchCriteria).exec()
	    .then(super.respondWithResult(res))
	    .catch(super.handleError(res));
    }

    getUser(req, res) {
	return _isUserIdAvailableInRequest(req)
	    .then((isAvailable) => {
		UserModel.findById(req.params.id).exec()
		    .then(super.handleEntityNotFound(res))
		    .then(super.respondWithResult(res))
		    .catch(super.handleError(res));
	    })
	    .catch(super.handleError(res));
    }

    createUser(req, res) {
	return _isUserAvailableInRequest(req)
	    .then((isAvailable) => {
		var user = new UserModel(req.body);
		user.save(req.body)
		    .then(super.respondWithResult(res, 201))
		    .catch(super.handleError(res));
	    })
	    .catch(super.handleError(res));
    }
}
