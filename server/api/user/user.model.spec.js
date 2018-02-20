import chai from 'chai';
import UserModel from './user.model';

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
	
	it('should be invalid if username is empty', function(done) {
	    user = new UserModel();

	    user.validate(function(err) {
		err.errors.username.name.should.equal('ValidatorError');
		err.errors.username.kind.should.equal('required');
		should.exist(err);
		done();
	    });
	});
	
	it('should be invalid if username is less than 5 characters');
	it('should be invalid if username is greater than 10 characters');
	it('should be invalid if username is already registered');
	
	it('should be invalid if email is empty');
	it('should be invalid if email is not in correct format');
	it('should be invalid if email is already registered');
	
	it('should be invalid if first name is empty');
	it('should be invalid if first name contains special characters');
	
	it('should be invalid if last name is empty');
	it('should be invalid if last name contains special characters');
	
	it('should be invalid if password is empty');
	it('should be invalid if password is less than 8 characters');
	it('should be invalid if password is greater than 15 characters');
	it('should be invalid if password does not contain uppercase characters');
	it('should be invalid if password does not contain lowercase characters');
	it('should be invalid if password does not contain numerals');
	it('should be invalid if password does not contain special characters');
    });
});

