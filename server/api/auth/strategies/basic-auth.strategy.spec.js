import basicAuthStrategy from './basic-auth.strategy';

import AuthorizationError from '../../auth.error.js';
import { VALIDATION_MESSAGES } from '../auth.constants';

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

	it('should return an error when username is not provided', function (done) {
		basicAuthStrategy(null, testValidUser.password, function (err, user) {
			should.exist(err);
			should.not.exist(user);

			err.message.should.equal(VALIDATION_MESSAGES.USERNAME_UNAVAILABLE);

			done();
		});
	});

	it('should return an error when password is not provided', function (done) {
		basicAuthStrategy(testValidUser.username, null, function (err, user) {
			should.exist(err);
			should.not.exist(user);

			err.message.should.equal(VALIDATION_MESSAGES.PASSWORD_UNAVAILABLE);

			done();
		});
	});

	it('should return an error when user is not found', function (done) {
		userModelMock
			.expects('findOne').withArgs({ username: testValidUser.username })
			.chain('exec')
			.resolves(null);

		basicAuthStrategy(testValidUser.username, testValidUser.password, function (err, user) {
			should.exist(err);
			should.not.exist(user);

			done();
		});
	});

	it('should return an error when password is wrong', function (done) {
		validUserMock
			.expects('authenticate').withArgs(testValidUser.password)
			.returns(false);

		userModelMock
			.expects('findOne').withArgs({ username: testValidUser.username })
			.chain('exec')
			.resolves(validUser);

		basicAuthStrategy(testValidUser.username, testValidUser.password, function (err, user) {
			should.exist(err);
			should.not.exist(user);

			done();
		});
	});

	it('should return an error on any other technical errors', function (done) {
		const ERR_MSG = 'Test invalid password';

		userModelMock
			.expects('findOne').withArgs({ username: testValidUser.username })
			.chain('exec')
			.rejects(new AuthorizationError(ERR_MSG));

		basicAuthStrategy(testValidUser.username, testValidUser.password, function (err, user) {
			should.exist(err);
			err.message.should.equal(ERR_MSG);
			should.not.exist(user);

			done();
		});
	});
});
