import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../app';
import { UserModel } from './user.model';

import { testUsers, testValidUser, testUserWithoutUsername, testInvalidUser, testInvalidId } from './user.fixtures';
import { VALIDATION_MESSAGES, STATUSES } from './user.constants';

describe('User API:', function() {
    after(function() {
	mongoose.models = {};
	mongoose.modelSchemas = {};

	mongoose.connection.close(() => {
	    console.log('Closing mongoose database connection.');
	});
    });
    
    describe('GET users', function() {
	beforeEach(function(done) {
	    UserModel.deleteMany({ username: /testuser/})
		.exec()
		.then(() => {
		    UserModel.create(testUsers)
			.then((users) => {
			    done();
			})
			.catch((err) => {
			    done(err);
			});
		})
		.catch((err) => {
		    done(err);
		})
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
	    request(app)
		.get('/api/users')
		.expect(200)
		.expect('Content-Type', /json/)
		.end(function(err, res) {
		    if (err)
			done(err);

		    var things = res.body;
		    things.should.be.instanceOf(Array);
		    things.length.should.equal(5);
		    things[0].username.should.equal(testUsers[0].username);

		    done();
		});
	});

	it('should fetch all active users', function(done) {
	    request(app)
		.get('/api/users')
		.query({ status: STATUSES[0] })
		.expect(200)
		.expect('Content-Type', /json/)
		.end(function(err, res) {
		    if (err)
			done(err);

		    var things = res.body;
		    things.should.be.instanceOf(Array);
		    things.length.should.equal(3);
		    things[0].username.should.equal(testUsers[0].username);

		    done();
		});
	});

	it('should return empty result when data is not found', function(done) {
	    request(app)
		.get('/api/users')
		.query({ status: 'NOTAVALIDSTATUS' })
		.expect(200)
		.end(function(err, res) {
		    if (err)
			done(err);

		    var things = res.body;
		    things.should.be.instanceOf(Array);
		    things.length.should.equal(0);
		    
		    done();
		});
	});

	it('should fetch user based on username and password', function(done) {
	    request(app)
		.get('/api/users')
		.query({ username: testUsers[0].username })
		.query({ password: testUsers[0].passwrod })
		.expect(200)
		.expect('Content-Type', /json/)
		.end(function(err, res) {
		    if (err)
			done(err);

		    var things = res.body;
		    things.should.be.instanceOf(Array);
		    things.length.should.equal(1);
		    things[0].username.should.equal(testUsers[0].username);
		    things[0].email.should.equal(testUsers[0].email);

		    done();
		});
	});
    });

    describe('POST users', function() {
	var newUser;
	
	beforeEach(function(done) {
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

	it('should return an error if user details are invalid', function(done) {
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

    describe('PUT users', function() {
	var originalUser;
	
	beforeEach(function(done) {
	    UserModel.findOneAndRemove({ username: testUsers[0].username })
		.exec()
		.then(() => {
		    originalUser = new UserModel(testUsers[0]);
		    originalUser.save()
			.then((user) => {
			    originalUser = user;
			    done();
			})
			.catch((err) => {
			    done(err);
			})
		})
		.catch((err) => {
		    done(err);
		});
	});
		   
	afterEach(function(done) {
	    UserModel.findOneAndRemove({ username: testUsers[0].username })
		.exec()
		.then(() => {
		    done();
		})
		.catch((err) => {
		    done(err);
		})
	});

	it('should update the current user with new user details', function(done) {
	    request(app)
		.put('/api/users/'+originalUser._id)
		.send(testUsers[1])
		.expect(200)
		.expect('Content-Type', /json/)
		.end(function(err, res) {
		    if (err)
			done(err);

		    var updatedUser = res.body;
		    updatedUser.username.should.equal(testUsers[0].username);
		    updatedUser.lastName.should.equal(testUsers[1].lastName);

		    done();
		});
	});

	it('should update the status of current user appropriately', function(done) {
	    request(app)
		.put('/api/users/'+originalUser._id)
		.send({ status: STATUSES[1] })
		.expect(200)
		.expect('Content-Type', /json/)
		.end(function(err, res) {
		    if (err)
			done(err);

		    var updatedUser = res.body;
		    updatedUser.username.should.equal(testUsers[0].username);
		    updatedUser.status.should.equal(STATUSES[1]);

		    done();
		});
	});

	it('should not update the current user\'s username and email with new user details', function(done) {
	    request(app)
		.put('/api/users/'+originalUser._id)
		.send(testUsers[1])
		.expect(200)
		.expect('Content-Type', /json/)	    
		.end(function(err, res) {
		    if (err)
			done(err);

		    var updatedUser = res.body;
		    updatedUser.username.should.equal(testUsers[0].username);
		    updatedUser.email.should.equal(testUsers[0].email);

    		    updatedUser.username.should.not.equal(testUsers[1].username);
		    updatedUser.email.should.not.equal(testUsers[1].email);

		    done();
		});
	});

	it('should return an error if id is not provided', function(done) {
	    request(app)
		.put('/api/users/""')
		.send(testUsers[1])
		.expect('Content-Type', /json/)	    
		.expect(500)
		.end(function(err, res) {
		    if (err)
			done(err);

		    res.body.name.should.equal('CastError');
		    res.body.message.should.contain('Cast to ObjectId failed');

		    done();
		});
	});

	it('should return an error if user details are not provided', function(done) {
	    request(app)
		.put('/api/users/'+originalUser._id)
		.expect(500)
		.expect('Content-Type', /json/)	    
		.end(function(err, res) {
		    if (err)
			done(err);

		    res.body.name.should.equals('Internal Server Error')
		    res.body.message.should.equals('User details is not provided.');
		    
		    done();
		})
	});
	
	it('should return an error if user details are invalid', function(done) {
	    request(app)
		.put('/api/users/'+originalUser._id)
		.send(testInvalidUser)
		.expect(500)
		.expect('Content-Type', /json/)	    
		.end(function(err, res) {
		    if (err)
			done(err);

		    var errors = res.body.errors;
		    should.exist(errors);

		    errors['firstName'].message.should.contain(VALIDATION_MESSAGES.NAME_NUMBERS);
		    errors['lastName'].message.should.contain(VALIDATION_MESSAGES.NAME_SPECIALCHAR);

		    done();
		});
	});
	
	it('should return appropriate error if user is not found', function(done) {
	    request(app)
		.put('/api/users/' + testInvalidId)
		.send(testUsers[0])
		.expect(404)
		.end(function(err, res) {
		    if (err)
			done(err);
		    else
			done();
		});
	});
    });

    describe('GET User', function() {
	var originalUser;
	
	beforeEach(function(done) {
	    UserModel.findOneAndRemove({ username: testUsers[0].username })
		.exec()
		.then(() => {
		    originalUser = new UserModel(testUsers[0]);
		    originalUser.save()
			.then((user) => {
			    originalUser = user;
			    done();
			})
			.catch((err) => {
			    done(err);
			})
		})
		.catch((err) => {
		    done(err);
		});
	});
		   
	afterEach(function(done) {
	    UserModel.findOneAndRemove({ username: testUsers[0].username })
		.exec()
		.then(() => {
		    done();
		})
		.catch((err) => {
		    done(err);
		})
	});
	
	it('should get userdetails for requested id', function(done) {
	    request(app)
		.get('/api/users/' + originalUser._id)
		.expect(200)
		.expect('Content-Type', /json/)
		.end(function(err, res) {
		    if (err)
			done(err);

		    var user = res.body;
		    should.exist(user);
		    user.username.should.equal(testUsers[0].username);

		    done();
		});
	});
	
	it('should return appropriate error if user is not found', function(done) {
	    request(app)
		.get('/api/users/' + testInvalidId)
		.expect(404)
		.end(function(err, res) {
		    if (err)
			done(err);
		    else
			done();
		});
	});
    });

    describe('DELETE User', function() {
	var originalUser;
	
	beforeEach(function(done) {
	    UserModel.findOneAndRemove({ username: testUsers[0].username })
		.exec()
		.then(() => {
		    originalUser = new UserModel(testUsers[0]);
		    originalUser.save()
			.then((user) => {
			    originalUser = user;
			    done();
			})
			.catch((err) => {
			    done(err);
			})
		})
		.catch((err) => {
		    done(err);
		});
	});
		   
	afterEach(function(done) {
	    UserModel.findOneAndRemove({ username: testUsers[0].username })
		.exec()
		.then(() => {
		    done();
		})
		.catch((err) => {
		    done(err);
		})
	});

	it('should remove a valid user', function(done) {
	    request(app)
		.delete('/api/users/' + originalUser._id)
		.expect(204)
		.end(function(err, res) {
		    if (err)
			done(err);
		    else
			done();
		});
	});
	
	it('should return appropriate error if user is not found', function(done) {
	    request(app)
		.delete('/api/users/' + testInvalidId)
		.expect(404)
		.end(function(err, res) {
		    if (err)
			done(err);
		    else
			done();
		});
	});
    });
});

