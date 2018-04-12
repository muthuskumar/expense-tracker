import JWTTokenAuth from './jwt-token-auth';

import { VALIDATION_MESSAGES } from './auth.constants';
import { UserModel } from '../../user/user.model';

describe('JWT token authenticator', function() {
    context('#Sign Token', function() {
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

	    should.exist(tokenResult.token);
	    should.not.exist(tokenResult.error);
	    tokenResult.token.should.not.equal(user._id);
	});

	it('should return an error if userid is not provided', function() {
	    tokenResult = jwtTokenAuthenticator.signUserId(null);

	    should.not.exist(tokenResult.token);
	    should.exist(tokenResult.error);
	    tokenResult.error.should.equal(VALIDATION_MESSAGES.USERID_UNAVAILABLE);
	});
	
	it('should return an error if unable to generate a token', function() {
	    var config = require('../../../config/environment');
	    var secretKey = config.jwtSecretKey;
	    config.jwtSecretKey = null;
	    
	    tokenResult = jwtTokenAuthenticator.signUserId(-1);

	    should.not.exist(tokenResult.token);
	    should.exist(tokenResult.error);
	    tokenResult.error.should.equal(VALIDATION_MESSAGES.JWT_SECRET_UNAVAILABLE);

	    config.jwtSecretKey = secretKey;
	});
    });
    
    context('#Verify Token', function() {
	var jwtTokenAuthenticator;
	var token;
	var tokenResult;
	
	beforeEach(function() {
	    jwtTokenAuthenticator = new JWTTokenAuth();
	});

	afterEach(function() {
	    tokenResult = null;
	    token = null;
	    jwtTokenAuthenticator = null;
	});
	
	it('should populate request with userId if token is verified', function() {
	    token = jwtTokenAuthenticator.signUserId(1).token;
	    tokenResult = jwtTokenAuthenticator.verifyToken(token);

	    tokenResult.userId.should.equal(1);
	    should.not.exist(tokenResult.error);
	});

	it('should return an error if token is not provided', function() {
	    tokenResult = jwtTokenAuthenticator.verifyToken(null);

	    should.not.exist(tokenResult.userId);
	    should.exist(tokenResult.error);
	    tokenResult.error.should.equal(VALIDATION_MESSAGES.TOKEN_UNAVAILABLE);
	});
	
	it('should return an error if token fails verification', function() {
	    tokenResult = jwtTokenAuthenticator.verifyToken('12345');

	    should.not.exist(tokenResult.userId);
	    should.exist(tokenResult.error);
	    tokenResult.error.should.match(/JsonWebTokenError:/);
	});
    });
});
