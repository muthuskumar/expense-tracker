import jwt from 'jsonwebtoken';

import JWTTokenAuth from 'jwt-token-auth';
import { UserModel } from '../user/user.model';

describe('JWT token authenticator', function() {
    context('#Sign Token', function() {
	var jwtTokenAuthenticator;
	var tokenResult;
	var jwtStub = {};
	
	beforeEach(function() {
	    jwtTokenAuthenticator = new JWTTokenAuth();
	});

	afterEach(function() {
	    tokenResult = null;
	    jwtTokenAuthenticator = null;
	    jwtStub = null;
	});
	
	it('should return a token for a given user id', function() {
	    var user = new UserModel({});

	    tokenResult = jwtTokenAuthenticator.signUserId(user._id);
	    should.exist(tokenResult.token);
	    should.not.exist(tokenResult.error);
	    tokenResult.token.should.not.equal(user._id);
	});
	
	it('should return an error if unable to generate a token', function() {
	    jwtStub = sinon.stub(jwt, 'sign').withArgs({ id: -1 }, { expiresIn: '5h' }).throws('Error: Fake error');
	    tokenResult = jwtTokenAuthenticator.signUserId(null);

	    should.not.exist(tokenResult.token);
	    should.exist(token.error);
	    tokenResult.error.should.equal(/Error:/);
	});
	
	it('should return an error if userid is not provided', function() {
	    tokenResult = jwtTokenAuthenticator.signUserId(null);

	    should.not.exist(tokenResult.token);
	    should.exist(token.error);
	    tokenResult.error.should.equal(/Error:/);
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
	    token = jwtTokenAuthenticator.signUserId(1);
	    tokenResult = jwtTokenAuthenticator.verifyUserId(token);

	    tokenResult.userId.should.equal(1);
	    should.not.exist(tokenResult.error);
	});
	
	it('should return an error if token fails verification', function() {
	    tokenResult = jwtTokenAuthenticator.verifyUserId('12345');

	    shoud.not.exist(tokenResult.userId);
	    should.exist(tokenResult.error);
	    tokenResult.error.should.equal(/JsonWebTokenError:/);
	});
	
	it('should return an error if token is not provided', function() {
	    tokenResult = jwtTokenAuthenticator.verifyUserId(null);

	    should.not.exist(tokenResult.userId);
	    should.exist(tokenResult.error);
	    tokenResult.error.should.equal(/Error:/);
	});
    });
});
