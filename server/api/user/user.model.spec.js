/*global should, sinon*/
import mongoose from 'mongoose';
import _bind from 'lodash/bind';

import { UserModel } from './user.model';
import { UserSchema } from './user.model';

import { VALIDATION_MESSAGES } from './user.constants';

describe('User', function () {
    after(function () {
	mongoose.models = {};
	mongoose.modelSchemas = {};
    });

    context('schema defintion', function () {
	var user;

	beforeEach(function () {
	    user = new UserModel();
	});

	it('should have username', function () {
	    user.should.have.property('username');
	});

	it('should have email', function () {
	    user.should.have.property('email');
	});

	it('should have firstName', function () {
	    user.should.have.property('firstName');
	});

	it('should have lastName', function () {
	    user.should.have.property('lastName');
	});

	it('should have password', function () {
	    user.should.have.property('password');
	});

	it('should have status', function () {
	    user.should.have.property('status');
	});

	afterEach(function () {
	    user = undefined;
	});
    });

    context('entry', function () {
	var user;
	var userCountStub;

	afterEach(() => {
	    if (userCountStub) {
		userCountStub.restore();
	    }
	});

	it('should be invalid if username is empty', function () {
	    user = new UserModel({
		username: ''
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['username'].message.should.equal(VALIDATION_MESSAGES.USERNAME_MANDATORY);
	    }

	});

	it('should be invalid if username is less than 5 characters', function () {
	    user = new UserModel({
		username: 'test'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['username'].message.should.equal(VALIDATION_MESSAGES.USERNAME_MINLENGTH);
	    }

	});

	it('should be invalid if username is greater than 20 characters', function () {
	    user = new UserModel({
		username: 'test12345678901234567890'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['username'].message.should.equal(VALIDATION_MESSAGES.USERNAME_MAXLENGTH);
	    }

	});

	it('should be invalid if username is already registered', function () {
	    user = new UserModel({
		username: 'testDuplicateUser'
	    });

	    userCountStub = sinon.stub(mongoose.model('User', UserSchema), 'count').resolves(1);

	    return user.validate().should.eventually.be.rejectedWith(VALIDATION_MESSAGES.USERNAME_UNAVAILABLE);
	});

	it('should always store username in lowercase', function () {
	    const username = 'TESTUSER';
	    user = new UserModel({
		username: username
	    });

	    user.validateSync();

	    user.username.should.equal(username.toLowerCase());
	});

	it('should be invalid if email is empty', function () {
	    user = new UserModel({
		username: 'testUser',
		email: ''
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['email'].message.should.equal(VALIDATION_MESSAGES.EMAIL_MANDATORY);
	    }
	});

	it('should be invalid if email is not in correct format', function () {
	    user = new UserModel({
		username: 'testUser',
		email: 'testUser'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['email'].message.should.equal(VALIDATION_MESSAGES.EMAIL_BADFORMAT);
	    }
	});

	it('should be invalid if email is already registered', function () {
	    user = new UserModel({
		username: 'testDuplicateUser',
		email: 'someone@somewhere.com'
	    });

	    userCountStub = sinon.stub(UserModel, 'count').resolves(1);
	    return user.validate().should.eventually.be.rejectedWith(VALIDATION_MESSAGES.EMAIL_UNAVAILABLE);
	});

	it('should be invalid if first name is empty', function () {
	    user = new UserModel({
		username: 'testUser',
		firstName: ''
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['firstName'].message.should.equal(VALIDATION_MESSAGES.FIRST_NAME_MANDATORY);
	    }
	});

	it('should be invalid if first name contains special characters', function () {
	    user = new UserModel({
		username: 'testUser',
		firstName: 'test@1'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['firstName'].message.should.equal(VALIDATION_MESSAGES.NAME_SPECIALCHAR);
	    }
	});

	it('should be invalid if first name contain numbers', function () {
	    user = new UserModel({
		username: 'testUser',
		firstName: 'test1'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['firstName'].message.should.equal(VALIDATION_MESSAGES.NAME_NUMBERS);
	    }
	});

	it('should be invalid if last name is empty', function () {
	    user = new UserModel({
		username: 'testUser',
		lastName: ''
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['lastName'].message.should.equal(VALIDATION_MESSAGES.LAST_NAME_MANDATORY);
	    }
	});

	it('should be invalid if last name contains special characters', function () {
	    user = new UserModel({
		username: 'testUser',
		lastName: 'test@'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['lastName'].message.should.equal(VALIDATION_MESSAGES.NAME_SPECIALCHAR);
	    }
	});

	it('should be invalid if last name contain numbers', function () {
	    user = new UserModel({
		username: 'testUser',
		lastName: 'test1'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['lastName'].message.should.equal(VALIDATION_MESSAGES.NAME_NUMBERS);
	    }
	});

	it('should return full name from first name and last name', function () {
	    user = new UserModel({
		firstName: 'test',
		lastName: 'user'
	    });

	    user.fullname.should.equal('test user');
	});

	it('should return full name equal to first name when last name is empty', function () {
	    user = new UserModel({
		firstName: 'test'
	    });

	    user.fullname.should.equal('test');
	});

	it('should return full name equal to last name when full name is empty', function () {
	    user = new UserModel({
		lastName: 'user'
	    });

	    user.fullname.should.equal('user');
	});

	it('should be invalid if password is empty', function () {
	    user = new UserModel({
		username: 'testUser',
		password: ''
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['password'].message.should.equal(VALIDATION_MESSAGES.PASSWORD_MANDATORY);
	    }
	});

	it('should be invalid if password is less than 8 characters', function () {
	    user = new UserModel({
		username: 'testUser',
		password: 'test'
	    });

	    return user.validate().should.eventually.be.rejectedWith(VALIDATION_MESSAGES.PASSWORD_MINLENGTH);
	});

	it('should be invalid if password is greater than 15 characters', function () {
	    user = new UserModel({
		username: 'testUser',
		password: 'test123456789012345'
	    });

	    return user.validate().should.eventually.be.rejectedWith(VALIDATION_MESSAGES.PASSWORD_MAXLENGTH);
	});

	it('should be invalid if password does not contain uppercase characters', function () {
	    user = new UserModel({
		password: 'test1user!'
	    });

	    return user.validate().should.eventually.be.rejectedWith(VALIDATION_MESSAGES.PASSWORD_UPPERCASE);
	});

	it('should be invalid if password does not contain lowercase characters', function () {
	    user = new UserModel({
		password: 'TEST1USER!'
	    });

	    return user.validate().should.eventually.be.rejectedWith(VALIDATION_MESSAGES.PASSWORD_LOWERCASE);
	});

	it('should be invalid if password does not contain numbers', function () {
	    user = new UserModel({
		password: 'TestUser!'
	    });

	    return user.validate().should.eventually.be.rejectedWith(VALIDATION_MESSAGES.PASSWORD_NUMBERS);
	});

	it('should be invalid if password does not contain special characters', function () {
	    user = new UserModel({
		password: 'Test1User'
	    });

	    return user.validate().should.eventually.be.rejectedWith(VALIDATION_MESSAGES.PASSWORD_SPECIALCHAR);
	});

	it('should encrypt password', function () {
	    const pwd = 'Test@123';
	    user = new UserModel({
		username: 'testuser',
		email: 'testuser@test.com',
		firstName: 'Test',
		lastName: 'User',
		password: 'Test@123'
	    });

	    var thisContext = user;
	    var boundMiddleWareFn = _bind(UserSchema._middlewareFunctions.encryptPassword, thisContext);
	    var next = sinon.spy();

	    boundMiddleWareFn(next);

	    user.password.should.not.equal(pwd);
	    sinon.assert.calledOnce(next);
	});

	it('should be able to compare with encrypted password', function () {
	    const pwd = 'Test@123';
	    user = new UserModel({
		username: 'testuser',
		email: 'testuser@test.com',
		firstName: 'Test',
		lastName: 'User',
		password: 'Test@123'
	    });

	    var thisContext = user;
	    var boundMiddleWareFn = _bind(UserSchema._middlewareFunctions.encryptPassword, thisContext);
	    var next = sinon.spy();

	    boundMiddleWareFn(next);

	    sinon.assert.calledOnce(next);
	    user.password.should.not.equal(pwd);
	    user.authenticate(pwd).should.equal(true);
	});

	it('should have default active status', function () {
	    user = new UserModel({});

	    var err = user.validateSync();

	    if (err) {
		should.not.exist(err.errors['status']);
	    }
	    user.status.should.equal('ACTIVE');
	});

	it('should be invalid if status is not active or inactive', function () {
	    user = new UserModel({
		status: 'INACTIVE'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['status'].message.should.equal('`INACTIVE` is not a valid enum value for path `status`.');
	    }
	});

	it('should be valid for all valid values', function () {
	    user = new UserModel({
		username: 'testuser',
		email: 'testuser@test.com',
		firstName: 'Test',
		lastName: 'User',
		password: 'Test@123'
	    });

	    var err = user.validateSync();
	    should.not.exist(err);

	    var userCountStub = sinon.stub(mongoose.model('User', UserSchema), 'count').resolves(0);

	    return user.validate()
		.then((value) => { // eslint-disable-line no-unused-vars
		    true.should.equal(true);
		    userCountStub.restore();
		})
		.catch((err) => {
		    should.not.exist(err);
		    userCountStub.restore();
		});
	});

	afterEach(function () {
	    user = undefined;
	});
    });
});

