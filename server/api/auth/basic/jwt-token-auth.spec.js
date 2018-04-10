import JWTTokenAuth from './jwt-token-auth';
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
	    tokenResult.error.should.equal('Error: UserId is not provided.');
	});
	
	it('should return an error if unable to generate a token', function() {
	    var config = require('../../../config/environment');
	    var secretKey = config.jwtSecretKey;
	    config.jwtSecretKey = null;
	    
	    tokenResult = jwtTokenAuthenticator.signUserId(-1);

	    should.not.exist(tokenResult.token);
	    should.exist(tokenResult.error);
	    tokenResult.error.should.match(/Error:/);

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
	    tokenResult = jwtTokenAuthenticator.verifyUserId(token);

	    tokenResult.userId.should.equal(1);
	    should.not.exist(tokenResult.error);
	});

	it('should return an error if token is not provided', function() {
	    tokenResult = jwtTokenAuthenticator.verifyUserId(null);

	    should.not.exist(tokenResult.userId);
	    should.exist(tokenResult.error);
	    tokenResult.error.should.match(/JsonWebTokenError:/);
	});
	
	it('should return an error if token fails verification', function() {
	    tokenResult = jwtTokenAuthenticator.verifyUserId('12345');

	    should.not.exist(tokenResult.userId);
	    should.exist(tokenResult.error);
	    tokenResult.error.should.match(/JsonWebTokenError:/);
	});
    });
});
