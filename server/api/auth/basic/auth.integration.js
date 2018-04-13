/*global should*/

import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import app from '../../../app';
import config from '../../../config/environment';

import { UserModel } from '../../user/user.model';
import { testUsers, testValidUser } from '../../user/user.fixtures';
import { VALIDATION_MESSAGES } from './auth.constants';

import { logger } from '../../../config/app-logger';

describe('Auth API', function() {
    after(function() {
	mongoose.models = {};
	mongoose.modelSchemas = {};

	mongoose.connection.close(() => {
	    logger.info('Closing mongoose database connection.');
	});
    });

    describe('Login', function() {
	beforeEach(function(done) {
	    UserModel.deleteMany({ username: /testuser/ })
		.exec()
		.then(() => {
		    UserModel.create(testUsers)
			.then((users) => { // eslint-disable-line no-unused-vars
			    done();
			})
			.catch((err) => {
			    done(err);
			});
		})
		.catch((err) => {
		    done(err);
		})
	});

	afterEach(function(done) {
	    UserModel.deleteMany({ username: /testuser/ })
		.then(() => {
		    done();
		})
		.catch((err) => {
		    done(err);
		});
	});

	it('should authenticate users with valid credentials', function(done) {
	    request(app)
		.post('/api/session')
		.set('Authorization', 'Basic ' + new Buffer(testUsers[0].username + ':' + testUsers[0].password).toString('base64'))
		.expect(201)
		.expect('Content-Type', /json/)
		.end((err, res) => {
		    if (err)
			done(err);
		    else {
			var tokenResult = res.body;
			should.exist(tokenResult.token);

			done();
		    }
		});
	});
	
	it('should respond with error message for users with incorrect credentials', function(done) {
	    request(app)
		.post('/api/session')
		.set('Authorization', 'Basic ' + new Buffer(testUsers[0].username + ':' + 'WrongPassword').toString('base64'))
		.expect(401)
		.expect('Content-Type', /json/)
		.end((err, res) => {
		    if (err)
			done(err);
		    else {
			var error = res.body.errors;

			should.exist(error);
			error.name.should.equal(VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER);
			error.message.should.equal(VALIDATION_MESSAGES.AUTH_FAILED);
			done();
		    }
		});
	});
	
	it('should respond with error message for requests without credentials', function(done) {
	    request(app)
		.post('/api/session')
		.expect(401)
		.expect('Content-Type', /json/)
		.end((err, res) => {
		    if (err)
			done(err);
		    else {
			var error = res.body.errors;

			should.exist(error);
			error.name.should.equal(VALIDATION_MESSAGES.ERROR_TYPE_UNAUTHORIZED_USER);
			error.message.should.equal(VALIDATION_MESSAGES.AUTH_DETAILS_NOT_PROVIDED);
			done();
		    }
		});
	});
    });

    context('Token Authentication', function() {
	const unsecurePaths = [
	    { path: '/api/users/', method: 'POST' },
	    { path: '/api/session/', method: 'POST' }
	];
	const TEST_USER_ID = testValidUser.username;
	var token;

	beforeEach(function(done) {
	    token = jwt.sign({ userId: TEST_USER_ID }, config.jwtSecretKey, { expiresIn: '5h' });

	    UserModel.deleteMany({ username: /testuser/})
		.exec()
		.then(() => {
		    UserModel.create(testUsers)
			.then((users) => { // eslint-disable-line no-unused-vars
			    done();
			})
			.catch((err) => {
			    done(err);
			});
		})
		.catch((err) => {
		    done(err);
		})
	});

	afterEach(function(done) {
	    token = null;

	    UserModel.deleteMany({ username: /testuser/})
		.then(() => {
		    done();
		})
		.catch((err) => {
		    done(err);
		});
	});

	it('should return results after token verification for secure routes', function(done) {
	    request(app)
		.get('/api/users')
		.set('Authorization', 'JWT ' + token)
		.expect(200)
		.end((err, res) => {
		    if (err)
			done(err);
		    else 
			done();
		});

	});

	it('should return error if token verification fails for secure routes', function(done) {
	    request(app)
		.get('/api/users')
		.expect(401)
		.end((err, res) => {
		    if (err)
			done(err);
		    else 
			done();
		});
	});
	
	it('should return results without token verification for unsecure routes', function(done) {
	    request(app)
		.post('/api/session')
		.set('Authorization', 'Basic ' + new Buffer(testValidUser.username + ':' + testValidUser.password).toString('base64'))	    
		.expect(201)
		.end((err, res) => {
		    if (err)
			done(err);
		    else 
			done();
		})
	});
    });
});
