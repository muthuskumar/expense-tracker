/*global should*/

import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../../app';
import config from '../../../config/environment';

import { UserModel } from '../../user/user.model';
import AuthError from '../../auth.error';
import { testUsers, testValidUser } from '../../user/user.fixtures';
import { VALIDATION_MESSAGES, AUTH_ERR_MESSAGES } from '../auth.constants';
import { errorName as authErrName } from '../../auth.error';
import { errorName as validationErrName } from '../../validation.error';

import { logger } from '../../../config/app-logger';

describe('Auth API', function () {
	before(function () {
		if (mongoose.connection.readyState === 0)
			mongoose.connect(config.mongo.uri, config.mongo.options)
				.then(() => {
					logger.info("Database connection established!");
				})
				.catch((err) => {
					logger.error("An error occured while starting the database.", err);
				});
	});

	after(function () {
		mongoose.models = {};
		mongoose.modelSchemas = {};

		mongoose.connection.close(() => {
			logger.info('Closing mongoose database connection.');
		});
	});

	describe('Login', function () {
		beforeEach(function (done) {
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

		afterEach(function (done) {
			UserModel.deleteMany({ username: /testuser/ })
				.then(() => {
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		it('should authenticate users with valid credentials', function (done) {
			request(app)
				.post('/api/session')
				.set('Authorization', 'Basic ' + new Buffer(testUsers[0].username + ':' + testUsers[0].password).toString('base64'))
				.expect(201)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					if (err)
						done(err);
					else {
						var token = res.body;
						should.exist(token);

						done();
					}
				});
		});

		it('should respond with error message for users with incorrect credentials', function (done) {
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
						error.name.should.equal(authErrName);
						error.message.should.equal(AUTH_ERR_MESSAGES.INVALID_PASSWORD);
						done();
					}
				});
		});

		it('should respond with error message for requests without credentials', function (done) {
			request(app)
				.post('/api/session')
				.expect(400)
				.expect('Content-Type', /json/)
				.end((err, res) => {
					if (err)
						done(err);
					else {
						var error = res.body.errors;

						should.exist(error);
						error.name.should.equal(validationErrName);
						error.message.should.equal(VALIDATION_MESSAGES.BASIC_AUTH_DETAILS_UNAVAILABLE);
						done();
					}
				});
		});
	});
});
