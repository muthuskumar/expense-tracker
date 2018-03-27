import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../';
import { UserModel } from './user.model';

import { testUsers, testValidUser, testUserWithoutUsername, testInvalidUser } from './user.fixtures';
import { VALIDATION_MESSAGES } from './user.constants';

describe('User API:', function() {

    describe('POST users', function() {
	var newUser;
	
	afterEach(function(done) {
	    UserModel.findOneAndRemove({ username: testUsers[0].username })
		.exec()
		.then(() => {
		    done();
		})
		.catch((err) => {
		    done(err);
		});

	    newUser = undefined;
	});
	
	it('should insert users successfully', function(done) {
	    request(app)
		.post('/api/users')
		.send(testUsers[0])
		.expect(201)
		.expect('Content-Type', /json/)
		.end(function(err, res) {
		    if(err)
			done(err);

		    newUser = res.body;
		    newUser.username.should.equal(testUsers[0].username);

		    done();
		});
	});

	it('should throw an error if user details are invalid', function(done) {
	    request(app)
		.post('/api/users')
		.send(testInvalidUser)
		.expect(500)
		.expect('Content-Type', /json/)
		.end(function(err, res) {
		    if(err)
			done(err);

		    var errors = res.body.errors;
		    should.exist(errors);

		    errors['username'].message.should.contain(VALIDATION_MESSAGES.USERNAME_MINLENGTH);
		    errors['email'].message.should.contain(VALIDATION_MESSAGES.EMAIL_BADFORMAT);
		    errors['firstName'].message.should.contain(VALIDATION_MESSAGES.NAME_NUMBERS);
		    errors['lastName'].message.should.contain(VALIDATION_MESSAGES.NAME_SPECIALCHAR);
		    errors['password'].message.should.contain(VALIDATION_MESSAGES.PASSWORD_MANDATORY);
		    
		    done();
		})
	});
    });
    
    describe('GET users', function() {
	beforeEach(function(done) {
	    UserModel.create(testUsers)
		.then((users) => {
		    done();
		})
		.catch((err) => {
		    done(err);
		});
	});

	afterEach(function(done) {
	    UserModel.deleteMany({ username: /testuser/})
		.then(() => {
		    done();
		})
		.catch((err) => {
		    done(err);
		});
	});
	
	it('should fetch all users', function(done) {
	    var things;
	    request(app)
		.get('/api/users')
		.expect(200)
		.expect('Content-Type', /json/)
		.end(function(err, res) {
		    if(err) done(err);

		    things = res.body;
		    things.should.be.instanceOf(Array);
		    things.length.should.equal(5);
		    things[0].username.should.equal('testuser1');

		    done();
		});
	});
    });
});

