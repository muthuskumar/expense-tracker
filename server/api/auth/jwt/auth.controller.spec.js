import { EventEmitter } from "events";
import { createRequest, createResponse } from 'node-mocks-http';

import { UserModel } from '../../user/user.model';
import { testValidUser } from '../../user/user.fixtures';

import { errorName as validationErrorName } from '../../validation.error';
import { VALIDATION_MESSAGES } from '../auth.constants';

import AuthController from './auth.controller';

describe('Auth Controller', function () {
	var httpReq;
	var httpRes;

	beforeEach(function () {
		httpRes = createResponse({
			eventEmitter: EventEmitter
		});
	});

	afterEach(function () {
		httpReq = null;
		httpRes = null;
	});

	it('should return validation error if authorization header is not available', function (done) {
		httpReq = createRequest({});

		httpRes.on('end', () => {
			try {
				httpRes.statusCode.should.equal(400);

				var err = JSON.parse(httpRes._getData()).errors;

				should.exist(err);
				should.not.exist(JSON.parse(httpRes._getData()).token);
				err.name.should.equal(validationErrorName);
				err.message.should.equal(VALIDATION_MESSAGES.AUTH_HEADER_UNAVAILABLE);

				done();
			} catch (err) {
				done(err);
			}
		});

		const authCtrl = new AuthController();
		authCtrl.authenticateUser(httpReq, httpRes);
	});
});
