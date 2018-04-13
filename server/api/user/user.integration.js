/*global should*/

import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import app from '../../app';
import config from '../../config/environment';
import { UserModel } from './user.model';

import { testUsers, testInvalidUser, testInvalidId } from './user.fixtures';
import { VALIDATION_MESSAGES, STATUSES } from './user.constants';

import { logger } from '../../config/app-logger';

describe('User API:', function() {
    var token;

    before(function() {
	if (mongoose.connection.readyState === 0)
	    mongoose.connect(config.mongo.uri, config.mongo.options)
	    .then(() => {
		logger.info("Database connection established!");
	    })
	    .catch((err) => {
		logger.error("An error occured while starting the database.", err);
	    });
    });
    
    after(function() {
	mongoose.models = {};
	mongoose.modelSchemas = {};

	mongoose.connection.close(() => {
	    logger.info('Closing mongoose database connection.');
	});
    });

    beforeEach(function() {

    });

    afterEach(function() {
	token = null;
    });
    
    describe('GET Users', function() {
	beforeEach(function(done) {
	    UserModel.deleteMany({ username: /testuser/})
		.exec()
		.then(() => {
		    UserModel.create(testUsers)
			.then((users) => {
			    token = jwt.sign({ userId: users[0]._id }, config.jwtSecretKey, { expiresIn: '5h' });
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
	    token = null;
	});
	
	it('should fetch all users', function(done) {
	    request(app)
		.get('/api/users')
		.set('Authorization', 'JWT ' + token)
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
    		.set('Authorization', 'JWT ' + token)
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
    		.set('Authorization', 'JWT ' + token)	    
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
    		.set('Authorization', 'JWT ' + token)	    
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

	it('should not return password in it\'s response', function(done) {
	    request(app)
		.get('/api/users')
    		.set('Authorization', 'JWT ' + token)	    
		.query({ username: testUsers[0].username })
		.expect(200)
		.expect('Content-Type', /json/)
		.end(function(err, res) {
		    if (err)
			done(err);

		    var things = res.body;
		    things.should.be.instanceOf(Array);
		    things.length.should.equal(1);
		    should.not.exist(things[0].password);
		    
		    done();
		});
	});
    });

    describe('POST Users', function() {
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

	it('should not return password in it\'s response', function(done) {
	    request(app)
		.post('/api/users')
		.send(testUsers[0])
		.expect(201)
		.expect('Content-Type', /json/)
		.end(function(err, res) {
		    if(err)
			done(err);

		    newUser = res.body;
		    should.not.exist(newUser.password);
		    
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

    describe('PUT Users', function() {
	var originalUser;
	
	beforeEach(function(done) {
	    UserModel.findOneAndRemove({ username: testUsers[0].username })
		.exec()
		.then(() => {
		    originalUser = new UserModel(testUsers[0]);
		    originalUser.save()
			.then((user) => {
			    originalUser = user;
			    token = jwt.sign({ userId: user._id }, config.jwtSecretKey, { expiresIn: '5h' });
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
		});
	    token = null;
	});

	it('should update the current user with new user details', function(done) {
	    request(app)
		.put('/api/users/'+originalUser._id)
		.set('Authorization', 'JWT ' + token)
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
		.set('Authorization', 'JWT ' + token)	    
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
		.set('Authorization', 'JWT ' + token)	    
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

	it('should not return password in it\'s response', function(done) {
	    request(app)
		.put('/api/users/'+originalUser._id)
		.set('Authorization', 'JWT ' + token)	    
		.send(testUsers[1])
		.expect(200)
		.expect('Content-Type', /json/)
		.end(function(err, res) {
		    if (err)
			done(err);

		    var updatedUser = res.body;
		    should.not.exist(updatedUser.password);

		    done();
		});
	});

	it('should return an error if id is not provided', function(done) {
	    request(app)
		.put('/api/users/""')
		.set('Authorization', 'JWT ' + token)	    
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
		.set('Authorization', 'JWT ' + token)	    
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
		.set('Authorization', 'JWT ' + token)	    
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
		.set('Authorization', 'JWT ' + token)	    
		.send(testUsers[0])
		.expect(404)
		.end(function(err, res) { // eslint-disable-line no-unused-vars
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
			    token = jwt.sign({ userId: user._id }, config.jwtSecretKey, { expiresIn: '5h' });
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
		});
	    
	    token = null;
	});
	
	it('should get userdetails for requested id', function(done) {
	    request(app)
		.get('/api/users/' + originalUser._id)
		.set('Authorization', 'JWT ' + token)	    
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

	it('should get userdetails for requested username', function(done) {
	    request(app)
		.get('/api/users/' + originalUser.username)
		.set('Authorization', 'JWT ' + token)	    
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

	it('should get userdetails for requested email', function(done) {
	    request(app)
		.get('/api/users/' + originalUser.email)
		.set('Authorization', 'JWT ' + token)	    
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

	it('should not return password in it\'s response', function(done) {
	    request(app)
		.get('/api/users/' + originalUser._id)
		.set('Authorization', 'JWT ' + token)	    
		.expect(200)
		.expect('Content-Type', /json/)
		.end(function(err, res) {
		    if (err)
			done(err);

		    var user = res.body;
		    should.exist(user);
		    user.username.should.equal(testUsers[0].username);
		    should.not.exist(user.password);

		    done();
		});
	});
	
	it('should return appropriate error if user is not found', function(done) {
	    request(app)
		.get('/api/users/' + testInvalidId)
		.set('Authorization', 'JWT ' + token)	    
		.expect(404)
		.end(function(err, res) { // eslint-disable-line no-unused-vars
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
			    token = jwt.sign({ userId: user._id }, config.jwtSecretKey, { expiresIn: '5h' });
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
		.set('Authorization', 'JWT ' + token)	    
		.expect(204)
		.end(function(err, res) { // eslint-disable-line no-unused-vars
		    if (err)
			done(err);
		    else
			done();
		});
	});
	
	it('should return appropriate error if user is not found', function(done) {
	    request(app)
		.delete('/api/users/' + testInvalidId)
		.set('Authorization', 'JWT ' + token)	    
		.expect(404)
		.end(function(err, res) { // eslint-disable-line no-unused-vars
		    if (err)
			done(err);
		    else
			done();
		});
	});
    });
});

