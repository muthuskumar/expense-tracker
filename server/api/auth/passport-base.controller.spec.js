import { EventEmitter } from "events";
import { createRequest, createResponse } from 'node-mocks-http';

import tokenSerializer from './output-serializers/token.serializer';
import { UserModel } from '../user/user.model';
import { testValidUser } from '../user/user.fixtures';
import { VALIDATION_MESSAGES, AUTH_ERR_MESSAGES } from './auth.constants';
import AuthError, { errorName as authErrorName } from '../auth.error';
import { errorName as validationErrorName } from '../validation.error';

import PassportBaseController from './passport-base.controller';

describe('passportAuthenticateCb', function () {
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

    it('should return authentication error if there are errors', function (done) {
        const TEST_ERR_MSG = 'Test Error Message.';
        httpReq = createRequest({});

        httpRes.on('end', () => {
            try {
                httpRes.statusCode.should.equal(404);

                var err = JSON.parse(httpRes._getData()).errors;
                var token = JSON.parse(httpRes._getData()).token;

                should.not.exist(token);

                should.exist(err);
                err.name.should.equal(authErrorName);
                err.message.should.equal(TEST_ERR_MSG);

                done();
            } catch (err) {
                done(err);
            }
        });

        var authController = new PassportBaseController();
        var cbFn = authController.passportAuthenticateCb(httpReq, httpRes, null);

        cbFn(new AuthError(TEST_ERR_MSG), null, null);
    });

    it('should return authentication error if user is not found', function (done) {
        httpReq = createRequest({});

        httpRes.on('end', () => {
            try {
                httpRes.statusCode.should.equal(404);

                var err = JSON.parse(httpRes._getData()).errors;
                var token = JSON.parse(httpRes._getData()).token;

                should.not.exist(token);

                should.exist(err);
                err.name.should.equal(authErrorName);
                err.message.should.equal(AUTH_ERR_MESSAGES.AUTH_FAILED);

                done();
            } catch (err) {
                done(err);
            }
        });

        var authController = new PassportBaseController();
        var cbFn = authController.passportAuthenticateCb(httpReq, httpRes, null);

        cbFn(null, null, null);
    });

    it('should return error if serializer is not provided', function (done) {
        const user = new UserModel(testValidUser);

        httpReq = createRequest({});
        httpRes.on('end', () => {
            try {
                httpRes.statusCode.should.equal(401);

                var err = JSON.parse(httpRes._getData()).errors;
                var token = JSON.parse(httpRes._getData()).token;

                should.not.exist(token);
                should.exist(err);
                err.name.should.equal(validationErrorName);
                err.message.should.equal(VALIDATION_MESSAGES.SERIALIZER_UNAVAILABLE);

                done();
            } catch (err) {
                done(err);
            }
        });

        var authController = new PassportBaseController();
        var cbFn = authController.passportAuthenticateCb(httpReq, httpRes, null);

        cbFn(null, user, null);
    });

    it('should return token if no errors', function (done) {
        const user = new UserModel(testValidUser);

        httpReq = createRequest({});
        httpReq.login = (user, options, cb) => {
            cb();
        };

        httpRes.on('end', () => {
            try {
                httpRes.statusCode.should.equal(201);

                var err = JSON.parse(httpRes._getData()).errors;
                var token = JSON.parse(httpRes._getData()).token;

                should.exist(token);
                should.not.exist(err);

                done();
            } catch (err) {
                done(err);
            }
        });

        var authController = new PassportBaseController();
        var cbFn = authController.passportAuthenticateCb(httpReq, httpRes, tokenSerializer);

        cbFn(null, user, null);
    });
});