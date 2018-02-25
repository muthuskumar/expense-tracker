import mongoose from 'mongoose';
import chai from 'chai';
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
		firstName: 'test@'
	    });

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['firstName'].message.should.equal('First name cannot contain special characters.');
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
		err.errors['lastName'].message.should.equal('Last name cannot contain special characters.');
	    }
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

	    var err = user.validateSync();

	    should.exist(err);
	    if (err) {
		err.errors['password'].message.should.equal('Password should be at least 8 characters long.');
	    }
	});
	
	it('should be invalid if password is greater than 15 characters');
	it('should be invalid if password does not contain uppercase characters');
	it('should be invalid if password does not contain lowercase characters');
	it('should be invalid if password does not contain numerals');
	it('should be invalid if password does not contain special characters');
	it('should be encrypted');

	it('should have default active status');
	it('should be invalid if status is not active or inactive');

	it('should be valid for all valid values');
	
	afterEach(function() {
	    user = undefined;
	});
    });
});
