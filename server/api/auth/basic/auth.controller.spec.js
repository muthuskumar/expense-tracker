/*global should, sinon*/

var events = require('events');
import { createRequest, createResponse } from 'node-mocks-http';

import AuthController from './auth.controller';
import { UserModel } from '../../user/user.model';
import config from '../../../config/environment';

import { VALIDATION_MESSAGES } from './auth.constants';
import { testValidUser, testUserWithoutUsername } from '../../user/user.fixtures';

describe('Auth Controller', function() {
    var httpReq;
    var httpRes;

    beforeEach(function() {
	httpRes = createResponse({
	    eventEmitter: events.EventEmitter
	});
    });
    
    afterEach(function() {
	httpReq = null;
	httpRes = null;
    });

    context('login', function() {
	var userMock

	beforeEach(function() {
	    userMock = sinon.mock(UserModel);
	});

	afterEach(function() {
	    userMock.verify();
	    userMock.restore();
	});
	
	it('should return a token and status if user is authenticated', function(done) {
	    const searchCriteria = { username: testValidUser.username };

	    httpReq = createRequest({
		method: 'POST',
		headers: {
		    'Authorization': 'Basic ' + new Buffer(testValidUser.username + ':' + testValidUser.password).toString('base64')
		}
	    });

	    var user = new UserModel(testValidUser);
	    user.authenticate = (password) => {
		return true;
	    };

	    userMock
		.expects('find').withArgs(searchCriteria)
		.chain('exec')
		.resolves([ user ]);

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(201);

		    var response = JSON.parse(httpRes._getData());
		    should.exist(response.token);

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.authenticateUser(httpReq, httpRes);	    
	});
	
	it('should return error and appropriate status if unable to authenticate user', function(done) {
	    const searchCriteria = { username: 'Invalid User' };
	    httpReq = createRequest({
		method: 'POST',
		headers: {
		    'Authorization': 'Basic ' + new Buffer('Invalid User' + ':' + 'Invalid Pwd').toString('base64')
		}		
	    });

	    userMock
		.expects('find').withArgs(searchCriteria)
		.chain('exec')
		.resolves([]);

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(401);

		    var err = JSON.parse(httpRes._getData()).errors;

		    should.exist(err);
		    should.not.exist(httpRes._getData().token);
		    err.name.should.equal(VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER);
		    err.message.should.equal(VALIDATION_MESSAGES.AUTH_FAILED);

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.authenticateUser(httpReq, httpRes);	    
	});

	it('should return error and appropriate status if authentication details are not provided', function(done) {
	    httpReq = createRequest({
		method: 'POST'
	    });

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(401);

		    var err = JSON.parse(httpRes._getData()).errors;

		    should.exist(err);
		    should.not.exist(httpRes._getData().token);
		    err.name.should.equal(VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER);
		    err.message.should.equal(VALIDATION_MESSAGES.AUTH_DETAILS_NOT_PROVIDED);

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.authenticateUser(httpReq, httpRes);	    
	});

	it('should return error and appropriate status if authentication details are invalid', function(done) {
	    httpReq = createRequest({
		method: 'POST',
		headers: {
		    'Authorization': 'Basic' + new Buffer('Invalid User' + ':' + 'Invalid Pwd').toString('base64')
		}		
	    });

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(401);

		    var err = JSON.parse(httpRes._getData()).errors;
		    
		    should.exist(err);
		    should.not.exist(httpRes._getData().token);
		    err.name.should.equal(VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER);
		    err.message.should.equal(VALIDATION_MESSAGES.AUTH_DETAILS_INVALID);

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.authenticateUser(httpReq, httpRes);	    
	});
	
	it('should return error and appropriate status on database exceptions', function(done) {
	    const searchCriteria = { username: testValidUser.username };
	    httpReq = createRequest({
		method: 'POST',
		headers: {
		    'Authorization': 'Basic ' + new Buffer(testValidUser.username + ':' + testValidUser.password).toString('base64')
		}
	    });

	    userMock
		.expects('find').withArgs(searchCriteria)
		.chain('exec')
		.rejects({ errors: { name: 'MongoError', code: 1 } });

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(500);

		    var err = JSON.parse(httpRes._getData()).errors;

		    should.exist(err);
		    should.not.exist(httpRes._getData().token);
		    err.name.should.equal(VALIDATION_MESSAGES.ERROR_TYPE_INTERNAL_SERVER);

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.authenticateUser(httpReq, httpRes);	    
	});

	it('should return error and appropriate status if unable to generate a token', function(done) {
	    const searchCriteria = { username: ' ' };
	    httpReq = createRequest({
		method: 'POST',
		headers: {
		    'Authorization': 'Basic ' + new Buffer(' ' + ':' + testValidUser.password).toString('base64')
		}		
	    });

	    userMock
		.expects('find').withArgs(searchCriteria)
		.chain('exec')
		.resolves([testValidUser]);

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(500);

		    var err = JSON.parse(httpRes._getData()).errors;

		    should.exist(err);
		    should.not.exist(httpRes._getData().token);
		    err.name.should.equal(VALIDATION_MESSAGES.ERROR_TYPE_INTERNAL_SERVER);

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.authenticateUser(httpReq, httpRes);	    

	});	
    });
});

