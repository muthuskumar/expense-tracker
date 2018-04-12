var events = require('events');
import jwt from 'jsonwebtoken';
import { createRequest, createResponse } from 'node-mocks-http';

import AuthMiddleware from './auth.middleware';
import { UserModel } from '../../user/user.model';
import config from '../../../config/environment';

import { VALIDATION_MESSAGES } from './auth.constants';
import { testValidUser, testUserWithoutUsername } from '../../user/user.fixtures';

describe('Auth Middleware', function() {
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

    context('verify token for secure paths', function() {
	const unsecurePaths = [{ path: '/api/users/', method: 'POST' }];
	const TEST_USER_ID = 12345;
	var token;

	beforeEach(function() {
	    token = jwt.sign({ userId: TEST_USER_ID }, config.jwtSecretKey, { expiresIn: '5h' });
	});

	afterEach(function() {
	    token = null;
	});
	
	it('should populate request with userId if token is verified for secure routes - 1', function(done) {
	    httpReq = createRequest({
		path: '/api/users/',
		method: 'GET',
		headers: {
		    'Authorization': 'JWT ' + token
		}		
	    });
	    
	    const authMw = new AuthMiddleware();
	    var mwFn = authMw.verifyUserOnlyForSecurePaths(unsecurePaths);

	    assert.isFunction(mwFn);

	    mwFn(httpReq, httpRes, (err) => {
		try {
		    should.not.exist(err);

		    should.exist(httpReq.userId);
		    httpReq.userId.should.equal(TEST_USER_ID);
		    done();
		} catch(err) {
		    done(err);
		}
	    });
	});

	it('should populate request with userId if token is verified for secure routes - 2', function(done) {
	    httpReq = createRequest({
		path: '/api/user/',
		method: 'POST',
		headers: {
		    'Authorization': 'JWT ' + token
		}		
	    });
	    
	    const authMw = new AuthMiddleware();
	    var mwFn = authMw.verifyUserOnlyForSecurePaths(unsecurePaths);

	    assert.isFunction(mwFn);

	    mwFn(httpReq, httpRes, (err) => {
		try {
		    should.not.exist(err);

		    should.exist(httpReq.userId);
		    httpReq.userId.should.equal(TEST_USER_ID);
		    done();
		} catch(err) {
		    done(err);
		}
	    });
	});
	
	it('should not perform verification for unsecure routes', function(done) {
	    httpReq = createRequest({
		path: '/api/users/',
		method: 'POST',
		headers: {
		    'Authorization': 'JWT ' + token
		}		
	    });
	    
	    const authMw = new AuthMiddleware();
	    var mwFn = authMw.verifyUserOnlyForSecurePaths(unsecurePaths);

	    assert.isFunction(mwFn);

	    mwFn(httpReq, httpRes, (err) => {
		try {
		    should.not.exist(err);

		    should.not.exist(httpReq.userId);
		    done();
		} catch(err) {
		    done(err);
		}
	    });
	});
	
	it('should return error and appropriate status if token fails verification', function(done) {
	    httpReq = createRequest({
		method: 'POST',
		headers: {
		    'Authorization': 'JWT ' + token + 's'
		}		
	    });

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(401);

		    var err = JSON.parse(httpRes._getData()).errors;

		    should.not.exist(httpReq.userId);
		    should.exist(err);
		    err.name.should.equal(VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER);
		    err.message.should.equal('invalid signature');

		    done();
		} catch(err) {
		    done(err);
		}
	    });

	    var authMw = new AuthMiddleware();
	    var mwFn = authMw.verifyUserOnlyForSecurePaths(unsecurePaths);
	    assert.isFunction(mwFn);

	    mwFn(httpReq, httpRes, (err) => {});	    
	});
    });
});

