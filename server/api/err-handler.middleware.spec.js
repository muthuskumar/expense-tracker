/*global should, sinon*/

import { EventEmitter } from "events";
import { createRequest, createResponse } from 'node-mocks-http';

import AuthError, { errorName as authErrorName } from "./auth.error";
import ValidationError, { errorName as validationErrorName } from "./validation.error";
import InternalServerError, { errorName as internalServerErrorName } from "./internal-server.error";

import { AUTH_ERR_MESSAGES } from './auth/auth.constants';

import errHandlerMiddleware from './err-handler.middleware';

describe('Error handling middleware', function () {
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

    it('should return an response with status 400 for validation error', function (done) {
        const TEST_MSG = 'Test Message.';
        var validationErr = new ValidationError('test', TEST_MSG);
        var nextSpy = sinon.spy();

        httpReq = createRequest({});

        httpRes.on('end', () => {
            try {
                httpRes.statusCode.should.equal(400);

                var err = JSON.parse(httpRes._getData()).errors;

                should.exist(err);

                err.name.should.equal(validationErrorName);
                err.message.should.equal(TEST_MSG);

                done();
            } catch (err) {
                done(err);
            }
        });

        errHandlerMiddleware(validationErr, httpReq, httpRes, nextSpy);
    });

    it('should return an response with status 401 for authorization error', function (done) {
        const TEST_MSG = 'Test Message.';
        var authErr = new AuthError(TEST_MSG);
        var nextSpy = sinon.spy();

        httpReq = createRequest({});

        httpRes.on('end', () => {
            try {
                httpRes.statusCode.should.equal(401);

                var err = JSON.parse(httpRes._getData()).errors;

                should.exist(err);

                err.name.should.equal(authErrorName);
                err.message.should.equal(TEST_MSG);

                done();
            } catch (err) {
                done(err);
            }
        });

        errHandlerMiddleware(authErr, httpReq, httpRes, nextSpy);
    });

    it('should return an response with status 401 for error named AuthorizationError', function (done) {
        const TEST_MSG = 'Test Message.';
        const testAuthErrName = AUTH_ERR_MESSAGES.PASSPORT_AUTH_ERR_NAME;
        var authErr = new Error(TEST_MSG);
        authErr.name = testAuthErrName;
        var nextSpy = sinon.spy();

        httpReq = createRequest({});

        httpRes.on('end', () => {
            try {
                httpRes.statusCode.should.equal(401);

                var err = JSON.parse(httpRes._getData()).errors;

                should.exist(err);

                err.name.should.equal(testAuthErrName);
                err.message.should.equal(TEST_MSG);

                done();
            } catch (err) {
                done(err);
            }
        });

        errHandlerMiddleware(authErr, httpReq, httpRes, nextSpy);
    });

    it('should return an response with status 500 for internal server errors', function (done) {
        const TEST_MSG = 'Test Message.';
        var internalServerErr = new InternalServerError(TEST_MSG);
        var nextSpy = sinon.spy();

        httpReq = createRequest({});

        httpRes.on('end', () => {
            try {
                httpRes.statusCode.should.equal(500);

                var err = JSON.parse(httpRes._getData()).errors;

                should.exist(err);

                err.name.should.equal(internalServerErrorName);
                err.message.should.equal(TEST_MSG);

                done();
            } catch (err) {
                done(err);
            }
        });

        errHandlerMiddleware(internalServerErr, httpReq, httpRes, nextSpy);
    });

    it('should return an response with status 500 for all other error', function (done) {
        const TEST_MSG = 'Test Message.';
        const TEST_ERR_NAME = 'TestError';
        var testErr = new Error(TEST_MSG);
        testErr.name = TEST_ERR_NAME;
        var nextSpy = sinon.spy();

        httpReq = createRequest({});

        httpRes.on('end', () => {
            try {
                httpRes.statusCode.should.equal(500);

                var err = JSON.parse(httpRes._getData()).errors;

                should.exist(err);

                err.name.should.equal(TEST_ERR_NAME);
                err.message.should.equal(TEST_MSG);

                done();
            } catch (err) {
                done(err);
            }
        });

        errHandlerMiddleware(testErr, httpReq, httpRes, nextSpy);
    });
});

