var events = require('events');
import { createRequest, createResponse } from 'node-mocks-http';

import AuthController from './auth.controller';

import { UserModel } from '../../user/user.model';
import { testValidUser } from '../../user/user.fixtures';

import AuthorizationError from '../../auth.error';
import { errorName as authErrorName } from '../../auth.error';
import { errorName as validationErrorName } from '../../validation.error';

import { VALIDATION_MESSAGES } from '../auth.constants';

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
    
    context('reqLoginCb', function() {
	it('should return token if there are no errors', function(done) {
	    const user = new UserModel(testValidUser);

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(201);

		    var err = JSON.parse(httpRes._getData()).errors;
		    var token = JSON.parse(httpRes._getData()).token;

		    should.not.exist(err);
		    should.exist(token);

		    done();
		} catch(err) {
		    done(err);
		}
	    });

	    const authCtrl = new AuthController();
	    const cbFn = authCtrl.reqLoginCb(user, httpRes);

	    cbFn();
	});
	
	it('should return error if there are errors', function(done) {
	    const user = new UserModel(testValidUser);
	    const TEST_ERROR_MSG = 'Test Error Message.';
	    
	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(400);

		    var err = JSON.parse(httpRes._getData()).errors;
		    var token = JSON.parse(httpRes._getData()).token;

		    should.not.exist(token);
		    
		    should.exist(err);
		    err.name.should.equal(authErrorName);
		    err.message.should.equal(TEST_ERROR_MSG);

		    done();
		} catch(err) {
		    done(err);
		}
	    });

	    const authCtrl = new AuthController();
	    const cbFn = authCtrl.reqLoginCb(user, httpRes);

	    cbFn(new AuthorizationError(TEST_ERROR_MSG));
	});

	it('should return error if there are jwt errors', function(done) {
	    var testUser = {};
	    testUser._id = null;
	    
	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(400);

		    var err = JSON.parse(httpRes._getData()).errors;
		    var token = JSON.parse(httpRes._getData()).token;

		    should.not.exist(token);
		    
		    should.exist(err);
		    err.name.should.equal(validationErrorName);
		    err.message.should.equal(VALIDATION_MESSAGES.USERID_UNAVAILABLE);

		    done();
		} catch(err) {
		    done(err);
		}
	    });

	    const authCtrl = new AuthController();
	    const cbFn = authCtrl.reqLoginCb(testUser, httpRes);

	    cbFn();
	});
    });

    context('passportAuthenticateCb', function() {
	it('should return authentication error if there are errors');
	it('should return authentication error if user is not found');
    });

    context('authenticateUser', function() {
	it('should return validation error if basic headers is not available', function(done) {
	    httpReq = createRequest({});

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(400);

		    var err = JSON.parse(httpRes._getData()).errors;

		    should.exist(err);
		    should.not.exist(JSON.parse(httpRes._getData()).token);
		    err.name.should.equal(validationErrorName);
		    err.message.should.equal(VALIDATION_MESSAGES.BASIC_AUTH_DETAILS_UNAVAILABLE);

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

