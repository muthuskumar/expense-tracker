import jwtAuthStrategy, { constructOptions } from './jwt-auth.strategy';
import config from '../../../config/environment';

import { errorName as authErrName } from '../../auth.error';
import { AUTH_ERR_MESSAGES } from '../auth.constants';

describe('JWT Auth Strategy', function () {
    it('should return user object on successful token validation', function (done) {
        var testPayload = { sub: 'This is a test token' };
        jwtAuthStrategy(testPayload, function (err, userObj) {
            should.not.exist(err);

            should.exist(userObj);
            userObj._id = testPayload.sub;

            done();
        });
    });

    it('should return an error when token is not available', function (done) {
        var testPayload = {};
        jwtAuthStrategy(testPayload, function (err, userObj) {
            should.not.exist(userObj);

            should.exist(err);
            err.name.should.equal(authErrName);
            err.message.should.equal(AUTH_ERR_MESSAGES.INVALID_TOKEN);

            done();
        });
    });

    context('construct options', function () {
        it('should return options object populated with details', function (done) {
            var opts = constructOptions();

            should.exist(opts);
            opts.secretOrKey = config.secretjwtSecretKey;

            done();
        });
    });
});
