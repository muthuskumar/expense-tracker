/*global should*/

import JWTTokenAuth from './jwt-token-auth';

import ValidationError from '../../validation.error';
import { VALIDATION_MESSAGES } from './auth.constants';
import { UserModel } from '../../user/user.model';

describe('JWT token authenticator', function() {
    context('sign token', function() {
	var jwtTokenAuthenticator;
	var tokenResult;
	
	beforeEach(function() {
	    jwtTokenAuthenticator = new JWTTokenAuth();
	});

	afterEach(function() {
	    tokenResult = null;
	    jwtTokenAuthenticator = null;
	});
	
	it('should return a token for a given user id', function() {
	    var user = new UserModel({});

	    tokenResult = jwtTokenAuthenticator.signUserId(user._id);

	    tokenResult.should.be.fulfilled;
	});

	it('should return an error if userid is not provided', function() {
	    tokenResult = jwtTokenAuthenticator.signUserId(null);

	    tokenResult.should.be.rejected;
	    tokenResult.should.be.rejectedWith(ValidationError, VALIDATION_MESSAGES.USERID_UNAVAILABLE);
	});
	
	it('should return an error if secret is not provided', function() {
	    var config = require('../../../config/environment');
	    var secretKey = config.jwtSecretKey;
	    config.jwtSecretKey = null;
	    
	    tokenResult = jwtTokenAuthenticator.signUserId(-1);

	    tokenResult.should.be.rejected;
	    tokenResult.should.be.rejectedWith(ValidationError, VALIDATION_MESSAGES.JWT_SECRET__UNAVAILABLE);

	    config.jwtSecretKey = secretKey;
	});
    });
    
    context('verify token', function() {
	var jwtTokenAuthenticator;
	var tokenResult;
	
	beforeEach(function() {
	    jwtTokenAuthenticator = new JWTTokenAuth();
	});

	afterEach(function() {
	    tokenResult = null;
	    jwtTokenAuthenticator = null;
	});
	
	it('should return userId if token is verified', function() {
	    jwtTokenAuthenticator.signUserId(1)
		.then((token) => {
		    tokenResult = jwtTokenAuthenticator.verifyToken(token);

		    tokenResult.should.be.fulfilled;
		    tokenResult.should.eventually.equal(1);
		});
	});

	it('should return an error if token is not provided', function() {
	    tokenResult = jwtTokenAuthenticator.verifyToken(null);

	    tokenResult.should.be.rejected;
	    tokenResult.should.be.rejectedWith(ValidationError, VALIDATION_MESSAGES.TOKEN_UNAVAILABLE);
	});
	
	it('should return an error if token fails verification', function() {
	    tokenResult = jwtTokenAuthenticator.verifyToken('12345');

	    tokenResult.should.be.rejected;
	    tokenResult.should.be.rejectedWith('jwt malformed');
	});
    });
});
