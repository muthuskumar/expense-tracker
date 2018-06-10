import jwtAuthStrategy, { constructOptions } from './jwt-auth.strategy';
import config from '../../../config/environment';

import { errorName as authErrName } from '../../auth.error';
import { AUTH_ERR_MESSAGES } from '../auth.constants';

describe('JWT Auth Strategy', function () {
    context('strategy', function (done) {
        it('should return user object on successful token validation', function (done) {
            var testPayload = { userId: 'This is a test token' };
            jwtAuthStrategy(testPayload, function (err, userObj) {
                should.not.exist(err);

                should.exist(userObj);
                userObj._id.should.equal(testPayload.userId);

                done();
            });
        });

        it('should return user object as false when token is not available', function (done) {
            var testPayload = {};
            jwtAuthStrategy(testPayload, function (err, userObj) {
                should.not.exist(err);

                should.exist(userObj);
                userObj.should.equal(false);

                done();
            });
        });

        it('should return user object as false when userId is not available', function (done) {
            var testPayload = { user: null };
            jwtAuthStrategy(testPayload, function (err, userObj) {
                should.not.exist(err);

                should.exist(userObj);
                userObj.should.equal(false);

                done();
            });
        });
    });


    context('construct options', function () {
        it('should return options object populated with details', function (done) {
            var opts = constructOptions();

            should.exist(opts);
            opts.secretOrKey.should.equal(config.jwtSecretKey);
            opts.jwtFromRequest.should.be.a('function');

            done();
        });

        it('should return options object even if secret is unavailable', function (done) {
            config.jwtSecretKey = null;

            var opts = constructOptions();

            should.exist(opts);
            should.not.exist(opts.secretOrKey);
            opts.jwtFromRequest.should.be.a('function');

            done();
        });
    });
});
