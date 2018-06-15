/*global sinon, should*/
import basicAuthStrategy from './basic-auth.strategy';

import InternalServerError from '../../internal-server.error';

import { UserModel } from '../../user/user.model';
import { testValidUser } from '../../user/user.fixtures';

describe('Basic Auth Strategy', function () {
    var userModelMock;
    var validUserMock;
    var validUser;

    beforeEach(function () {
	validUser = new UserModel(testValidUser);

	userModelMock = sinon.mock(UserModel);
	validUserMock = sinon.mock(validUser);
    });

    afterEach(function () {
	userModelMock.verify();
	userModelMock.restore();

	validUserMock.verify();
	validUserMock.restore();
    });

    it('should return an user on successful username and password validation', function (done) {
	validUserMock
	    .expects('authenticate').withArgs(testValidUser.password)
	    .returns(true);

	userModelMock
	    .expects('findOne').withArgs({ username: testValidUser.username })
	    .chain('exec')
	    .resolves(validUser);

	basicAuthStrategy(testValidUser.username, testValidUser.password, function (err, user) {
	    should.not.exist(err);

	    should.exist(user);
	    user.should.equal(validUser);

	    done();
	});
    });

    it('should return user field as false when user is not found', function (done) {
	userModelMock
	    .expects('findOne').withArgs({ username: testValidUser.username })
	    .chain('exec')
	    .resolves(null);

	basicAuthStrategy(testValidUser.username, testValidUser.password, function (err, user) {
	    should.not.exist(err);
	    
	    should.exist(user);
	    user.should.equal(false);

	    done();
	});
    });

    it('should return user field as false when password is wrong', function (done) {
	validUserMock
	    .expects('authenticate').withArgs(testValidUser.password)
	    .returns(false);

	userModelMock
	    .expects('findOne').withArgs({ username: testValidUser.username })
	    .chain('exec')
	    .resolves(validUser);

	basicAuthStrategy(testValidUser.username, testValidUser.password, function (err, user) {
	    should.not.exist(err);

	    should.exist(user);
	    user.should.equal(false);

	    done();
	});
    });

    it('should return an error on any other technical errors', function (done) {
	const ERR_MSG = 'Test Error';

	userModelMock
	    .expects('findOne').withArgs({ username: testValidUser.username })
	    .chain('exec')
	    .rejects(new InternalServerError(ERR_MSG));

	basicAuthStrategy(testValidUser.username, testValidUser.password, function (err, user) {
	    should.exist(err);
	    err.message.should.equal(ERR_MSG);
	    
	    should.not.exist(user);

	    done();
	});
    });
});

