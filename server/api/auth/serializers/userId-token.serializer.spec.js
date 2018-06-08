import { EventEmitter } from "events";
import { createRequest, createResponse } from 'node-mocks-http';

import { testValidUser } from '../../user/user.fixtures';
import { UserModel } from '../../user/user.model';
import { errorName as validationErrorName } from '../../validation.error';
import { VALIDATION_MESSAGES } from '../auth.constants';

import UserIdTokenSerializer from "./userId-token.serializer";

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
        var next = sinon.spy();

        httpReq = createRequest({});
        httpReq.user = user;

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

        var serializer = new UserIdTokenSerializer();
        serializer.middlewareFn(httpReq, httpRes, next);
    });

    it('should call next with error if user is not present in request', function (done) {

        httpReq = createRequest({});
        var next = sinon.spy();
        
        var serializer = new UserIdTokenSerializer();
        serializer.middlewareFn(httpReq, httpRes, next);
        
        next.calledOnce;

        done();
    });

    it('should call next with error if there are jwt errors', function (done) {
        const user = new UserModel(testValidUser);
        user._id = null;

        httpReq = createRequest({});
        httpReq.user = user;
        var next = sinon.spy();
        
        var serializer = new UserIdTokenSerializer();
        serializer.middlewareFn(httpReq, httpRes, next);

        next.calledOnce;
        
        done();
    });
});
