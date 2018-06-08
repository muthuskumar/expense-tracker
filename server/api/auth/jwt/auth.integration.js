/*global should*/

import request from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../../../app';
import config from '../../../config/environment';

import { testValidUser } from '../../user/user.fixtures';

describe('Token Authentication', function () {
    const TEST_USER_ID = testValidUser.username;
    var token;

    beforeEach(function (done) {
        token = jwt.sign({ userId: TEST_USER_ID }, config.jwtSecretKey, { expiresIn: '5h' });
        done();
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
            .expect(401)
            .end((err, res) => { // eslint-disable-line no-unused-vars
                if (err)
                    done(err);
                else
                    done();
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