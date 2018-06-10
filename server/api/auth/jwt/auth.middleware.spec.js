/*global assert, should*/

var events = require('events');
import { createRequest, createResponse } from 'node-mocks-http';

import '../strategies';
import JWTTokenAuth from '../util/jwt-token.util';
import AuthMiddleware from './auth.middleware';

import { VALIDATION_MESSAGES } from '../auth.constants';
import { UserModel } from '../../user/user.model';
import { testValidUser } from '../../user/user.fixtures';

describe('Auth Middleware', function () {
	var httpReq;
	var httpRes;
	var jwtAuth;

	beforeEach(function () {
		httpRes = createResponse({
			eventEmitter: events.EventEmitter
		});

		jwtAuth = new JWTTokenAuth();
	});

	afterEach(function () {
		httpReq = null;
		httpRes = null;
		jwtAuth = null;
	});

	context('verify token for secure paths', function () {
		const unsecurePaths = [
			{ path: '/api/users', method: 'POST' },
			{ path: '/api/session', method: 'POST' }
		];
		const TEST_USER_ID = new UserModel(testValidUser)._id+0;
		var token;

		beforeEach(function (done) {
			jwtAuth.signUserId(TEST_USER_ID)
				.then((tokenResult) => {
					token = tokenResult;
					done();
				})
				.catch((err) => {
					done(err);
				});
		});

		afterEach(function () {
			token = null;
		});

		it('should populate request with userId if token is verified for secure routes', function (done) {
			httpReq = createRequest({
				path: '/api/users',
				method: 'GET',
				headers: {
					'Authorization': 'bearer ' + token
				}
			});

			httpReq.logIn = function(user, options, done) {
				this['user'] = user;
				done();
			}

			const authMw = new AuthMiddleware();
			var mwFn = authMw.verifyTokenOnlyForSecurePaths(unsecurePaths);

			assert.isFunction(mwFn);

			mwFn(httpReq, httpRes, (err) => {
				try {
					should.not.exist(err);

					should.exist(httpReq.user._id);
					httpReq.user._id.should.equal(TEST_USER_ID);

					done();
				} catch (err) {
					done(err);
				}
			});
		});

		it('should not perform verification for unsecure routes', function (done) {
			httpReq = createRequest({
				path: '/api/users',
				method: 'POST'
			});

			const authMw = new AuthMiddleware();
			var mwFn = authMw.verifyTokenOnlyForSecurePaths(unsecurePaths);

			assert.isFunction(mwFn);

			mwFn(httpReq, httpRes, (err) => {
				try {
					should.not.exist(err);

					should.not.exist(httpReq.user);
					done();
				} catch (err) {
					done(err);
				}
			});
		});

		it('should return error and appropriate status if token fails verification', function (done) {
			httpReq = createRequest({
				method: 'POST',
				headers: {
					'Authorization': 'bearer ' + 1234
				}
			});

			var authMw = new AuthMiddleware();
			var mwFn = authMw.verifyTokenOnlyForSecurePaths(unsecurePaths);
			assert.isFunction(mwFn);

			mwFn(httpReq, httpRes, (err) => { 
				try {
					httpRes.statusCode.should.equal(401);
					should.not.exist(httpReq.user);

					done();
				} catch (err) {
					done(err);
				}
			});
		});

		it('should return error and appropriate status if token is not provided', function (done) {
			httpReq = createRequest({
				method: 'POST',
			});

			var authMw = new AuthMiddleware();
			var mwFn = authMw.verifyTokenOnlyForSecurePaths(unsecurePaths);
			assert.isFunction(mwFn);

			mwFn(httpReq, httpRes, (err) => {
				try {
					httpRes.statusCode.should.equal(401);
					should.not.exist(httpReq.user);

					done();
				} catch (err) {
					done(err);
				}
			});
		});
	});
});

