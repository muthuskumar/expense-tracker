var events = require('events');
import { createRequest, createResponse } from 'node-mocks-http';
import jwt from 'jsonwebtoken';

import AuthController from './auth.controller';
import { UserModel } from '../../user/user.model';
import config from '../../../config/environment';

import { VALIDATION_MESSAGES } from './auth.constants';
import { testValidUser, testUserWithoutUsername } from '../../user/user.fixtures';

describe('Auth Controller', function() {
    var httpReq;
    var httpRes;
    var userProtoMock;

    beforeEach(function() {
	httpRes = createResponse({
	    eventEmitter: events.EventEmitter
	});
    });
    
    afterEach(function() {
	httpReq = null;
	httpRes = null;
    });

    context('User Registration', function() {
	beforeEach(function() {
	    userProtoMock = sinon.mock(UserModel.prototype);
	});

	afterEach(function() {
	    userProtoMock.verify();
	    userProtoMock.restore();
	});

	it('should return a token and status when user is registered', function(done) {
	    httpReq = createRequest({
		method: 'POST',
		body: testValidUser
	    });

	    userProtoMock
		.expects('save').withArgs(testValidUser)
		.resolves(new UserModel({}));

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
	    authCtrl.registerUser(httpReq, httpRes);	    
	});
	
	it('should respond with error message & status code if user details is not provided', function(done) {
	    httpReq = createRequest({
		method: 'POST'
	    });

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(500);

		    var err = httpRes._getData();
		    should.exist(err);
		    err.name.should.equal('Internal Server Error');
		    err.message.should.equal('User details is not provided.');

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.registerUser(httpReq, httpRes);
	});

	it('should respond with error message & status code if user details is invalid', function(done) {
	    httpReq = createRequest({
		method: 'POST',
		body: testUserWithoutUsername
	    });

	    userProtoMock
		.expects('save').withArgs(testUserWithoutUsername)
		.rejects({ name: 'ValidationError', message: 'Username is mandatory!' });

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(500);

		    var err = httpRes._getData();
		    should.exist(err);
		    err.name.should.equal('ValidationError');
		    err.message.should.equal('Username is mandatory!');

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.registerUser(httpReq, httpRes);
	});

	it('should respond with error message & status code for db exceptions', function(done) {
	    httpReq = createRequest({
		method: 'POST',
		body: testValidUser
	    });

	    userProtoMock
		.expects('save').withArgs(testValidUser)
		.rejects({ name: 'MongoError', code: 1 });

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(500);

		    var err = httpRes._getData();
		    should.exist(err);
		    err.name.should.equal('MongoError');

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.registerUser(httpReq, httpRes);
	});	

	it('should return error and appropriate status if unable to generate a token', function(done) {
	    httpReq = createRequest({
		method: 'POST',
		body: testValidUser
	    });

	    userProtoMock
		.expects('save').withArgs(testValidUser)
		.resolves(testValidUser);

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(500);

		    var response = JSON.parse(httpRes._getData());
		    should.exist(response.err);
		    response.err.should.equal('UserId is not provided.');

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.registerUser(httpReq, httpRes);	    
	});
    });

    context('Login', function() {
	var userMock
	beforeEach(function() {
	    userMock = sinon.mock(UserModel);
	});

	afterEach(function() {
	    userMock.verify();
	    userMock.restore();
	});
	
	it('should return a token and status if user is authenticated', function(done) {
	    const searchCriteria = { username: testValidUser.username, password: testValidUser.password };

	    httpReq = createRequest({
		method: 'POST',
		headers: {
		    'Authorization': 'Basic ' + new Buffer(testValidUser.username + ':' + testValidUser.password).toString('base64')
		}
	    });

	    userMock
		.expects('find').withArgs(searchCriteria)
		.chain('exec')
		.resolves([new UserModel(testValidUser)]);

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(200);

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
	    const searchCriteria = { username: 'Invalid User', password: 'Invalid Pwd' };
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
		    var response = JSON.parse(httpRes._getData());
		    var err = response.errors;
		    console.log(err);
		    should.exist(err);
		    should.not.exist(httpRes._getData().token);
		    err.name.should.equal(VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER);
		    err.message.shoul.equal(VALIDATION_MESSAGES.AUTH_FAILED);

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.authenticateUser(httpReq, httpRes);	    
	});

	it('should return error and appropriate status if authentication details not provided', function(done) {
	    httpReq = createRequest({
		method: 'POST'
	    });

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(401);

		    var err = JSON.parse(httpRes._getData().errors);
		    should.exist(err);
		    should.not.exist(httpRes._getData().token);
		    err.name.equal(VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER);
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
	    const searchCriteria = { username: 'Invalid User', password: 'Invalid Pwd' };
	    httpReq = createRequest({
		method: 'POST',
		headers: {
		    'Authorization': 'Basic' + new Buffer('Invalid User' + ':' + 'Invalid Pwd').toString('base64')
		}		
	    });

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(401);

		    var err = JSON.parse(httpRes._getData().errors);
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
	    const searchCriteria = { username: testValidUser.username, password: testValidUser.password };
	    httpReq = createRequest({
		method: 'POST',
		headers: {
		    'Authorization': 'Basic ' + new Buffer(testValidUser.username + ':' + testValidUser.password).toString('base64')
		}
	    });

	    userMock
		.expects('find').withArgs(searchCriteria)
		.rejects({ name: 'MongoError', code: 1 });

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(500);

		    var err = JSON.parse(httpRes._getData().errors);
		    should.exist(err);
		    should.not.exist(https._getData().token);
		    err.name.should.equal('MongoError');

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.authenticateUser(httpReq, httpRes);	    
	});

	it('should return error and appropriate status if unable to generate a token', function(done) {
	    const searchCriteria = { username: testValidUser.username, password: testValidUser.password };
	    httpReq = createRequest({
		method: 'POST',
		body: searchCriteria
	    });

	    userMock
		.expects('find').withArgs(searchCriteria)
		.chain('exec')
		.rejects(testValidUser);

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(500);

		    var err = JSON.parse(httpRes._getData().errors);
		    should.exist(err);
		    should.not.exist(httpRes._getData().token);
		    err.name.should.equal('JSONWebTokenError');
		    err.message.should.equal('Unable to generate token for provided details.');

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.authenticateUser(httpReq, httpRes);	    

	});	
    });

    context('Verify Token', function() {
	const TEST_USER_ID = 12345;
	var token;

	beforeEach(function() {
	    token = jwt.sign({ id: TEST_USER_ID }, config.jwtSecretKey, { expiresIn: '5h' });
	});

	afterEach(function() {
	    token = null;
	});
	
	it('should populate request with userId if token is verified', function(done) {
	    httpReq = createRequest({
		method: 'POST',
		headers: {
		    'Authorization': 'JWT ' + token
		}		
	    });

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(200);

		    var response = JSON.parse(httpRes._getData());
		    should.exist(response.userId);
		    response.userId.should.equal(TEST_USER_ID);

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.verifyUser(httpReq, httpRes);	    
	});
	
	it('should return error and appropriate status if token fails verification', function(done) {
	    httpReq = createRequest({
		method: 'POST',
		headers: {
		    'Authorization': 'JWT ' + -1
		}		
	    });

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(401);

		    var err = JSON.parse(httpRes._getData().errors);
		    should.exist(err);
		    should.not.exist(httpRes._getData.userId);
		    err.name.should.equal(VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER);
		    err.message.should.equal('Invalid authorization details.');		    

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.verifyUser(httpReq, httpRes);	    

	});
	
	it('should return error and appropriate status if token is not provided', function(done) {
	    httpReq = createRequest({
		method: 'POST',
		headers: {
		    'Authorization': 'JWT '
		}		
	    });

	    httpRes.on('end', () => {
		try {
		    httpRes.statusCode.should.equal(401);

		    var err = JSON.parse(httpRes._getData().errors);
		    should.exist(err);
		    should.not.exist(httpRes._getData().userId);
		    err.name.should.equal(VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER);
		    err.message.should.equal('Invalid authorization details.');

		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    
	    const authCtrl = new AuthController();
	    authCtrl.verifyUser(httpReq, httpRes);	    

	});
    });
});

