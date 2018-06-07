import { EventEmitter } from "events";
import { createRequest, createResponse } from 'node-mocks-http';

import { testValidUser } from '../../user/user.fixtures';
import { UserModel } from '../../user/user.model';
import AuthError, { errorName as authErrorName } from '../../auth.error';
import { errorName as validationErrorName } from '../../validation.error';
import { VALIDATION_MESSAGES } from '../auth.constants';

import tokenSerializer from './token.serializer';

describe('tokenSerializer', function () {
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

    it('should return token if there are no errors', function (done) {
        const user = new UserModel(testValidUser);

        httpRes.on('end', () => {
            try {
                httpRes.statusCode.should.equal(201);

                var err = JSON.parse(httpRes._getData()).errors;
                var token = JSON.parse(httpRes._getData());

                should.not.exist(err);
                should.exist(token);

                done();
            } catch (err) {
                done(err);
            }
        });

        tokenSerializer(user, httpReq, httpRes);
    });

    it('should return error if there are jwt errors', function (done) {
        var testUser = {};
        testUser._id = null;

        httpRes.on('end', () => {
            try {
                httpRes.statusCode.should.equal(400);

                var err = JSON.parse(httpRes._getData()).errors;
                var token = JSON.parse(httpRes._getData()).token;

                should.not.exist(token);

                should.exist(err);
                err.name.should.equal(validationErrorName);
                err.message.should.equal(VALIDATION_MESSAGES.USERID_UNAVAILABLE);

                done();
            } catch (err) {
                done(err);
            }
        });

        tokenSerializer(testUser, httpReq, httpRes);
    });
});
