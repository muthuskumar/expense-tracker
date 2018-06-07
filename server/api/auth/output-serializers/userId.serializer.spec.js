import { EventEmitter } from "events";
import { createRequest, createResponse } from 'node-mocks-http';

import { UserModel } from '../../user/user.model';
import { errorName as validationErrorName } from '../../validation.error';
import { VALIDATION_MESSAGES } from '../auth.constants';

import userIdSerializer from './userId.serializer';

describe('userIdSerializer', function () {
    var httpReq;
    var httpRes;

    beforeEach(function () {
        httpReq = createRequest({});
        httpRes = createResponse({
            eventEmitter: EventEmitter
        });
    });

    afterEach(function () {
        httpReq = null;
        httpRes = null;
    });

    it('should populate request object with user id when id is available', function (done) {
        var testUser = new UserModel({});

        userIdSerializer(testUser, httpReq, httpRes);
        httpReq.userId.should.equal(testUser._id);

        done();
    });

    it('should return an error when user id is not available', function (done) {
        var testUser = {};
        testUser._id = null;

        httpRes.on('end', () => {
            try {
                httpRes.statusCode.should.equal(400);

                var err = JSON.parse(httpRes._getData()).errors;

                should.exist(err);
                err.name.should.equal(validationErrorName);
                err.message.should.equal(VALIDATION_MESSAGES.USERID_UNAVAILABLE);

                done();
            } catch (err) {
                done(err);
            }
        });

        userIdSerializer(testUser, httpReq, httpRes);
    });
});