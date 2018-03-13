import mongoose from 'mongoose';
import chai from 'chai';
import _bind from 'lodash/bind';

import { UserModel } from './user.model';
import { UserSchema } from './user.model';

var should = chai.should();

describe('User', function() {
    context('schema defintion', function() {
	var user;
	
	before(function() {
	    user = new UserModel();
	});

	it('should have username', function() {
	    user.should.have.property('username');
	});
	
	it('should have email', function() {
	    user.should.have.property('email');
	});
	
	it('should have firstName', function() {
	    user.should.have.property('firstName');
	});
	
	it('should have lastName', function() {
	    user.should.have.property('lastName');
	});
	
	it('should have password', function() {
	    user.should.have.property('password');
	});

	it('should have status', function() {
	    user.should.have.property('status');
	});

	after(function() {
	    user = undefined;
	});
    });

    context('entry', function(done) {
	var user;
	
	it('should be invalid if username is empty', function() {
	    user = new UserModel({
		username: ''
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['username'].message.should.equal('Username is mandatory!');
	    }
	    
	});
	
	it('should be invalid if username is less than 5 characters', function() {
	    user = new UserModel({
		username: 'test'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['username'].message.should.equal('Username should be at least 5 characters long.');
	    }
	    
	});
	
	it('should be invalid if username is greater than 20 characters', function() {
	    user = new UserModel({
		username: 'test12345678901234567890'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['username'].message.should.equal('Username should not be more than 20 characters long.');
	    }
	    
	});
	
	it('should be invalid if username is already registered', function() {
	    user = new UserModel({
		username: 'testDuplicateUser'
	    });

	    var userCountStub = sinon.stub(mongoose.model('User', UserSchema), 'count').resolves(1);

	    return user.validate()
		.then((value) => {
		    // If the validation logic fails this part of the code should not exist.
		    // Inserting a dummy assertion to make sure this part of code doesn't exist.
		    true.should.be.false;
		})
		.catch((err) => {
		    // Above dummy assertion will throw an AssertionError when validation logic fails
		    // because of which the promise will fail and catch block will be called which
		    // needs to be identify this from the actual error thrown when validation fails.
		    if (err.errors) {
			// Assert actual validation failure error.
			should.exist(err.errors['username']);
			err.errors['username'].message.should.equal('Username is already registered.');
		    } else if (err.message === 'expected true to be false') {
			// Assert the validation logic failure, so that it is printed in the console.
			should.not.exist(err, 'Duplicate username validation logic failed.');
		    }

		    userCountStub.restore();
		});
	});

	it('should always store username in lowercase', function() {
	    const username = 'TESTUSER';
	    user = new UserModel({
		username: username
	    });

	    user.validateSync();

	    user.username.should.equal(username.toLowerCase());
	});
	
	it('should be invalid if email is empty', function() {
	    user = new UserModel({
		username: 'testUser',
		email: ''
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['email'].message.should.equal('email is mandatory!');
	    }
	});
	
	it('should be invalid if email is not in correct format', function() {
	    user = new UserModel({
		username: 'testUser',
		email: 'testUser'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['email'].message.should.equal('email id is not of correct format.');
	    }
	});
	
	it('should be invalid if email is already registered', function() {
	    user = new UserModel({
		username: 'testDuplicateUser',
		email: 'someone@somewhere.com'
	    });

	    var userCountStub = sinon.stub(mongoose.model('User', UserSchema), 'count').resolves(1);

	    return user.validate()
		.then((value) => {
		    // If the validation logic fails this part of the code should not exist.
		    // Inserting a dummy assertion to make sure this part of code doesn't exist.
		    true.should.be.false;
		})
		.catch((err) => {
		    // Above dummy assertion will throw an AssertionError when validation logic fails
		    // because of which the promise will fail and catch block will be called which
		    // needs to be identify this from the actual error thrown when validation fails.
		    if (err.errors) {
			// Assert actual validation failure error.
			should.exist(err.errors['email']);
			err.errors['email'].message.should.equal('email is already registered.');
		    } else if (err.message === 'expected true to be false') {
			// Assert the validation logic failure, so that it is printed in the console.
			should.not.exist(err, 'Duplicate email validation logic failed.');
		    }
		    userCountStub.restore();		    
		});
	});
	
	it('should be invalid if first name is empty', function() {
	    user = new UserModel({
		username: 'testUser',
		firstName: ''
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['firstName'].message.should.equal('First name is mandatory!');
	    }
	});
	
	it('should be invalid if first name contains special characters', function() {
	    user = new UserModel({
		username: 'testUser',
		firstName: 'test@1'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['firstName'].message.should.equal('Name cannot contain special characters.');
	    }
	});

	it('should be invalid if first name contain numbers', function() {
	    user = new UserModel({
		username: 'testUser',
		firstName: 'test1'
	    });

	    var err = user.validateSync();
	    
	    should.exist(err);
	    if (err) {
		err.errors['firstName'].message.should.equal('Name cannot contain numbers.');
	    }
	});	
	
	it('should be invalid if last name is empty', function() {
	    user = new UserModel({
		username: 'testUser',
		lastName: ''
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['lastName'].message.should.equal('Last name is mandatory!');
	    }
	});
	
	it('should be invalid if last name contains special characters', function() {
	    user = new UserModel({
		username: 'testUser',
		lastName: 'test@'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['lastName'].message.should.equal('Name cannot contain special characters.');
	    }
	});

	it('should be invalid if last name contain numbers', function() {
	    user = new UserModel({
		username: 'testUser',
		lastName: 'test1'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['lastName'].message.should.equal('Name cannot contain numbers.');
	    }
	});

	it('should return full name from first name and last name', function() {
	    user = new UserModel({
		firstName: 'test',
		lastName: 'user'
	    });

	    user.fullname.should.equal('test user');
	});

	it('should return full name equal to first name when last name is empty', function() {
	    user = new UserModel({
		firstName: 'test'
	    });

	    user.fullname.should.equal('test');
	});

	it('should return full name equal to last name when full name is empty', function() {
	    user = new UserModel({
		lastName: 'user'
	    });

	    user.fullname.should.equal('user');
	});
	
	it('should be invalid if password is empty', function() {
	    user = new UserModel({
		username: 'testUser',
		password: ''
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['password'].message.should.equal('Password is mandatory!');
	    }
	});
	
	it('should be invalid if password is less than 8 characters', function() {
	    user = new UserModel({
		username: 'testUser',
		password: 'test'
	    });

	    return user.validate()
		.then((value) => {
		    // If the validation logic fails this part of the code should not exist.
		    // Inserting a dummy assertion to make sure this part of code doesn't exist.
		    true.should.be.false;
		})
		.catch((err) => {
		    // Above dummy assertion will throw an AssertionError when validation logic fails
		    // because of which the promise will fail and catch block will be called which
		    // needs to be identify this from the actual error thrown when validation fails.
		    if (err.errors) {
			// Assert actual validation failure error.
			should.exist(err.errors['password']);
			err.errors['password'].message.should.include('The password must be at least 8 characters long.');
		    } else if (err.message === 'expected true to be false') {
			// Assert the validation logic failure, so that it is printed in the console.
			should.not.exist(err, 'Password validation logic failed.');
		    }
		});
	    
	    user = new UserModel({
		username: 'testUser',
		password: 'Test@123'
	    });

	    var err = user.validateSync();
	    should.not.exist(err.errors['password']);
	});
	
	it('should be invalid if password is greater than 15 characters', function() {
	    user = new UserModel({
		username: 'testUser',
		password: 'test123456789012345'
	    });

	    return user.validate()
		.then((value) => {
		    // If the validation logic fails this part of the code should not exist.
		    // Inserting a dummy assertion to make sure this part of code doesn't exist.
		    true.should.be.false;
		})
		.catch((err) => {
		    // Above dummy assertion will throw an AssertionError when validation logic fails
		    // because of which the promise will fail and catch block will be called which
		    // needs to be identify this from the actual error thrown when validation fails.
		    if (err.errors) {
			// Assert actual validation failure error.
			should.exist(err.errors['password']);
			err.errors['password'].message.should.include('The password must be fewer than 15 characters.');
		    } else if (err.message === 'expected true to be false') {
			// Assert the validation logic failure, so that it is printed in the console.
			should.not.exist(err, 'Password validation logic failed.');
		    }
		});
	    
    	    user = new UserModel({
		username: 'testUser',
		password: 'Test@1234567890'
	    });

	    var err = user.validateSync();

	    should.not.exist(err.errors['password']);
	});
	
	it('should be invalid if password does not contain uppercase characters', function() {
	    user = new UserModel({
		password: 'test1user!'
	    });

	    return user.validate()
		.then((value) => {
		    // If the validation logic fails this part of the code should not exist.
		    // Inserting a dummy assertion to make sure this part of code doesn't exist.
		    true.should.be.false;
		})
		.catch((err) => {
		    // Above dummy assertion will throw an AssertionError when validation logic fails
		    // because of which the promise will fail and catch block will be called which
		    // needs to be identify this from the actual error thrown when validation fails.
		    if (err.errors) {
			// Assert actual validation failure error.
			should.exist(err.errors['password']);
			err.errors['password'].message.should.include('The password must contain at least one uppercase letter.');
		    } else if (err.message === 'expected true to be false') {
			// Assert the validation logic failure, so that it is printed in the console.
			should.not.exist(err, 'Password validation logic failed.');
		    }
		});
	});
	
	it('should be invalid if password does not contain lowercase characters', function() {
	    user = new UserModel({
		password: 'TEST1USER!'
	    });

	    return user.validate()
		.then((value) => {
		    // If the validation logic fails this part of the code should not exist.
		    // Inserting a dummy assertion to make sure this part of code doesn't exist.
		    true.should.be.false;
		})
		.catch((err) => {
		    // Above dummy assertion will throw an AssertionError when validation logic fails
		    // because of which the promise will fail and catch block will be called which
		    // needs to be identify this from the actual error thrown when validation fails.
		    if (err.errors) {
			// Assert actual validation failure error.
			should.exist(err.errors['password']);
			err.errors['password'].message.should.include('The password must contain at least one lowercase letter.');
		    } else if (err.message === 'expected true to be false') {
			// Assert the validation logic failure, so that it is printed in the console.
			should.not.exist(err, 'Password validation logic failed.');
		    }
		});	    
	});
	
	it('should be invalid if password does not contain numbers', function() {
	    user = new UserModel({
		password: 'TestUser!'
	    });

	    return user.validate()
		.then((value) => {
		    // If the validation logic fails this part of the code should not exist.
		    // Inserting a dummy assertion to make sure this part of code doesn't exist.
		    true.should.be.false;
		})
		.catch((err) => {
		    // Above dummy assertion will throw an AssertionError when validation logic fails
		    // because of which the promise will fail and catch block will be called which
		    // needs to be identify this from the actual error thrown when validation fails.
		    if (err.errors) {
			// Assert actual validation failure error.
			should.exist(err.errors['password']);
			err.errors['password'].message.should.include('The password must contain at least one number.');
		    } else if (err.message === 'expected true to be false') {
			// Assert the validation logic failure, so that it is printed in the console.
			should.not.exist(err, 'Password validation logic failed.');
		    }
		});
	});
	
	it('should be invalid if password does not contain special characters', function() {
	    user = new UserModel({
		password: 'Test1User'
	    });

	    return user.validate()
		.then((value) => {
		    // If the validation logic fails this part of the code should not exist.
		    // Inserting a dummy assertion to make sure this part of code doesn't exist.
		    true.should.be.false;
		})
		.catch((err) => {
		    // Above dummy assertion will throw an AssertionError when validation logic fails
		    // because of which the promise will fail and catch block will be called which
		    // needs to be identify this from the actual error thrown when validation fails.
		    if (err.errors) {
			// Assert actual validation failure error.
			should.exist(err.errors['password']);
			err.errors['password'].message.should.include('The password must contain at least one special character.');
		    } else if (err.message === 'expected true to be false') {
			// Assert the validation logic failure, so that it is printed in the console.
			should.not.exist(err, 'Password validation logic failed.');
		    }
		});
	});
	
	it('should encrypt password', function() {
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

	it('should have default active status', function() {
	    user = new UserModel({});
	    
	    var err = user.validateSync();

	    if (err) {
		should.not.exist(err.errors['status']);
	    }
	    user.status.should.equal('ACTIVE');
	});
	
	it('should be invalid if status is not active or inactive', function() {
	    user = new UserModel({
		status: 'INACTIVE'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['status'].message.should.equal('`INACTIVE` is not a valid enum value for path `status`.');
	    }
	});

	it('should be valid for all valid values', function() {
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
		.then((value) => {
		    true.should.equal(true);
		    userCountStub.restore();
		})
		.catch((err) => {
		    should.not.exist(err);
		    userCountStub.restore();
		});
	});

	afterEach(function() {
	    user = undefined;
	});
    });
});

