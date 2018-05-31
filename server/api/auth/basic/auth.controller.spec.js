var events = require('events');
import { createRequest, createResponse } from 'node-mocks-http';

import AuthController from './auth.controller';

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
	it('should return token if there are no error');
	it('should return error if there are errors');
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
		    err.name.should.equal('ValidationError');
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

