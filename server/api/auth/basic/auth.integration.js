/*global should*/

import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../../app';

import { UserModel } from '../../user/user.model';
import { testUsers } from '../../user/user.fixtures';
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
	
	it('should respond with error message for users with incorrect credentials');
	it('should respond with error message for requests without credentials');
    });
});
