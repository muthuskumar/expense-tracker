import mongoose from 'mongoose';
import request from 'supertest';

import JWTTokenAuth from '../util/jwt-token.util';

import app from '../../../app';
import config from '../../../config/environment';

import { UserModel } from '../../user/user.model';
import { testValidUser } from '../../user/user.fixtures';

import { logger } from '../../../config/app-logger';

describe('JWT Auth API', function () {
    const TEST_USER_ID = new UserModel(testValidUser)._id + 0;
    var jwtAuth;
    var token;

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

    beforeEach(function (done) {
        jwtAuth = new JWTTokenAuth();
        jwtAuth.signUserId(TEST_USER_ID)
            .then((tokenResult) => {
                token = tokenResult;
                done();
            })
            .catch((err) => {
                done(err);
            });
    });

    afterEach(function (done) {
        token = null;
        done();
    });

    it('should return results after token verification for secure routes', function (done) {
        request(app)
            .get('/api/users')
            .set('Authorization', 'bearer ' + token)
            .expect(200)
            .end((err, res) => { // eslint-disable-line no-unused-vars
                if (err)
                    done(err);
                else
                    done();
            });

    });

    it('should return error if token verification fails for secure routes', function (done) {
        request(app)
            .get('/api/users')
            .set('Authorization', 'bearer ' + 1234)
            .expect(401)
            .end((err, res) => { // eslint-disable-line no-unused-vars
                if (err)
                    done(err);
                else
                    done();
            });
    });

    it('should return error if no token is provided for secure routes', function (done) {
        request(app)
            .get('/api/users')
            .expect(401)
            .end((err, res) => { // eslint-disable-line no-unused-vars
                if (err)
                    done(err);
                else
                    done();
            });
    });

    context('Unsecure routes', function () {
        beforeEach(function (done) {
            UserModel.deleteMany({ username: testValidUser.username })
                .exec()
                .then(() => {
                    UserModel.create(testValidUser)
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
            UserModel.deleteMany({ username: testValidUser.username })
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('should return results without token verification for unsecure routes', function (done) {
            request(app)
                .post('/api/session')
                .set('Authorization', 'Basic ' + new Buffer(testValidUser.username + ':' + testValidUser.password).toString('base64'))
                .expect(201)
                .end((err, res) => { // eslint-disable-line no-unused-vars
                    if (err)
                        done(err);
                    else
                        done();
                })
        });
    });
});
