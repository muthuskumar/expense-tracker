/*global should, sinon, Reflect*/
var events = require('events');
var mongoose = require('mongoose');

import { createRequest, createResponse } from 'node-mocks-http';

import { UserModel } from './user.model';
import UserController from './user.controller';
import { testUsers, testValidUser, testUserWithoutUsername, testUpdatedUser } from './user.fixtures';

describe('User Controller ', function () {

	var httpReq;
	var httpRes;

	beforeEach(function () {
		httpRes = createResponse({
			eventEmitter: events.EventEmitter
		});
	});

	afterEach(function () {
		httpReq = null;
		httpRes = null;
	});

	context('find users', function () {
		var userModelMock;

		beforeEach(function () {
			userModelMock = sinon.mock(UserModel);
		});

		afterEach(function () {
			userModelMock.verify();
			userModelMock.restore();
		});

		it('should respond with results & status code when no search criteria is given', function (done) {
			httpReq = createRequest({
				method: 'GET'
			});

			userModelMock
				.expects('find')
				.chain('sort').withArgs({ _id: 'asc' })
				.chain('exec')
				.resolves(testUsers);

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(200);

					var users = JSON.parse(httpRes._getData());
					should.exist(users);
					users.length.should.equal(testUsers.length);

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.getUsers(httpReq, httpRes);
		});

		it('should respond with results & status code when search criteria is provided', function (done) {
			var searchCriteria = { username: testUsers[0].username };
			httpReq = createRequest({
				method: 'GET',
				query: searchCriteria
			});

			userModelMock
				.expects('find').withArgs(searchCriteria)
				.chain('sort').withArgs({ _id: 'asc' })
				.chain('exec')
				.resolves([testUsers[0]]);

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(200);

					var users = JSON.parse(httpRes._getData());
					should.exist(users);
					users.length.should.equal(1);
					users[0].username.should.equal(testUsers[0].username);

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.getUsers(httpReq, httpRes);
		});

		it('should respond with empty list & status code when no users are found', function (done) {
			var searchCriteria = { username: 'testusername' };
			httpReq = createRequest({
				method: 'GET',
				query: searchCriteria
			});

			userModelMock
				.expects('find').withArgs(searchCriteria)
				.chain('sort').withArgs({ _id: 'asc' })
				.chain('exec')
				.resolves([]);

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(200);

					var users = JSON.parse(httpRes._getData());
					should.exist(users);
					users.length.should.equal(0);

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.getUsers(httpReq, httpRes);
		});

		it('should respond with error message & status code for db exceptions', function (done) {
			httpReq = createRequest({
				method: 'GET'
			});

			userModelMock
				.expects('find')
				.chain('sort').withArgs({ _id: 'asc' })
				.chain('exec')
				.rejects({ name: 'MongoError', code: 1 });

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(500);

					var err = httpRes._getData();
					should.exist(err);
					err.name.should.equal('MongoError');

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.getUsers(httpReq, httpRes);
		});
	});

	context('get user', function () {
		var userModelMock;

		beforeEach(function () {
			userModelMock = sinon.mock(UserModel);
		});

		afterEach(function () {
			userModelMock.verify();
			userModelMock.restore();
		});

		it('should respond with user details & status code for given user id', function (done) {
			const testUser = new UserModel({});
			const TESTUSERID = testUser._id;
			httpReq = createRequest({
				method: 'GET',
				params: {
					id: TESTUSERID
				}
			});

			userModelMock
				.expects('findOne').withArgs({ _id: TESTUSERID })
				.chain('exec')
				.resolves(testUsers[0]);

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(200);

					var user = JSON.parse(httpRes._getData());
					should.exist(user);
					user.username.should.equal(testUsers[0].username);

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.getUser(httpReq, httpRes);
		});

		it('should respond with user details & status code for given username', function (done) {
			const TESTUSERNAME = testUsers[0].username;
			httpReq = createRequest({
				method: 'GET',
				params: {
					id: TESTUSERNAME
				}
			});

			userModelMock
				.expects('findOne').withArgs({ username: TESTUSERNAME })
				.chain('exec')
				.resolves(testUsers[0]);

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(200);

					var user = JSON.parse(httpRes._getData());
					should.exist(user);
					user.username.should.equal(testUsers[0].username);

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.getUser(httpReq, httpRes);
		});

		it('should respond with user details & status code for given email', function (done) {
			const TESTUSEREMAIL = testUsers[0].email;
			httpReq = createRequest({
				method: 'GET',
				params: {
					id: TESTUSEREMAIL
				}
			});

			userModelMock
				.expects('findOne').withArgs({ email: TESTUSEREMAIL })
				.chain('exec')
				.resolves(testUsers[0]);

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(200);

					var user = JSON.parse(httpRes._getData());
					should.exist(user);
					user.username.should.equal(testUsers[0].username);

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.getUser(httpReq, httpRes);
		});

		it('should respond with error message & status code if user id is not provided', function (done) {
			httpReq = createRequest({
				method: 'GET'
			});

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(500);

					var err = httpRes._getData();
					should.exist(err);
					err.name.should.equal('Internal Server Error');
					err.message.should.equal('UserId is not provided.');

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.getUser(httpReq, httpRes);
		});

		it('should respond with error message & status code if user is not found', function (done) {
			const testUser = new UserModel({});
			const TESTUSERID = testUser._id;
			httpReq = createRequest({
				method: 'GET',
				params: {
					id: TESTUSERID
				}
			});

			userModelMock
				.expects('findOne').withArgs({ _id: TESTUSERID })
				.chain('exec')
				.resolves(null);

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(404);

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.getUser(httpReq, httpRes);
		});

		it('should respond with error message & status code for db exceptions', function (done) {
			const testUser = new UserModel({});
			const TESTUSERID = testUser._id;
			httpReq = createRequest({
				method: 'GET',
				params: {
					id: TESTUSERID
				}
			});

			userModelMock
				.expects('findOne').withArgs({ _id: TESTUSERID })
				.chain('exec')
				.rejects({ name: 'MongoError', code: 1 });

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(500);

					var err = httpRes._getData();
					should.exist(err);
					err.name.should.equal('MongoError');

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.getUser(httpReq, httpRes);
		});
	});

	context('save user', function () {
		var userProtoMock;

		beforeEach(function () {
			userProtoMock = sinon.mock(UserModel.prototype);
		});

		afterEach(function () {
			userProtoMock.verify();
			userProtoMock.restore();
		});

		it('should respond with newly create user for provided details & status code', function (done) {
			httpReq = createRequest({
				method: 'POST',
				body: testValidUser
			});

			userProtoMock
				.expects('save').withArgs(testValidUser)
				.resolves(testValidUser);

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(201);

					var user = JSON.parse(httpRes._getData());
					should.exist(user);
					user.username.should.equal(testValidUser.username);

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.createUser(httpReq, httpRes);
		});

		it('should respond with error message & status code if user details is not provided', function (done) {
			httpReq = createRequest({
				method: 'POST'
			});

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(500);

					var err = httpRes._getData();
					should.exist(err);
					err.name.should.equal('Internal Server Error');
					err.message.should.equal('User details is not provided.');

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.createUser(httpReq, httpRes);
		});

		it('should respond with error message & status code if user details is invalid', function (done) {
			httpReq = createRequest({
				method: 'POST',
				body: testUserWithoutUsername
			});

			userProtoMock
				.expects('save').withArgs(testUserWithoutUsername)
				.rejects({ name: 'ValidationError', message: 'Username is mandatory!' });

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(500);

					var err = httpRes._getData();
					should.exist(err);
					err.name.should.equal('ValidationError');
					err.message.should.equal('Username is mandatory!');

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.createUser(httpReq, httpRes);
		});

		it('should respond with error message & status code for db exceptions', function (done) {
			httpReq = createRequest({
				method: 'POST',
				body: testValidUser
			});

			userProtoMock
				.expects('save').withArgs(testValidUser)
				.rejects({ name: 'MongoError', code: 1 });

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(500);

					var err = httpRes._getData();
					should.exist(err);
					err.name.should.equal('MongoError');

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.createUser(httpReq, httpRes);
		});
	});

	context('update user', function () {
		var userModelMock;
		var userDetailsWithoutUniqueFields;

		beforeEach(function () {
			userModelMock = sinon.mock(UserModel);
			userDetailsWithoutUniqueFields = Object.assign({}, testUsers[1]);
			Reflect.deleteProperty(userDetailsWithoutUniqueFields, 'username');
			Reflect.deleteProperty(userDetailsWithoutUniqueFields, 'email');
		});

		afterEach(function () {
			userModelMock.verify();
			userModelMock.restore();
		});

		it('should respond with updated user & status code', function (done) {
			const TESTUSERID = 1;
			httpReq = createRequest({
				method: 'PUT',
				params: {
					id: TESTUSERID
				},
				body: Object.assign({}, testUsers[1])
			});

			userModelMock
				.expects('findByIdAndUpdate').withArgs(TESTUSERID, userDetailsWithoutUniqueFields, { new: true, runValidators: true })
				.chain('exec')
				.resolves(testUpdatedUser);

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(200);

					var user = JSON.parse(httpRes._getData());
					should.exist(user);
					user.username.should.not.equal(testUsers[1].username);
					user.username.should.equal(testUsers[0].username);

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.updateUser(httpReq, httpRes);
		});

		it('should respond with error message & status code if user id is not provided', function (done) {
			httpReq = createRequest({
				method: 'PUT'
			});

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(500);

					var err = httpRes._getData();
					should.exist(err);
					err.name.should.equal('Internal Server Error');
					err.message.should.equal('UserId is not provided.');

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.updateUser(httpReq, httpRes);
		});

		it('should respond with error message & status code when user details are not provided', function (done) {
			httpReq = createRequest({
				method: 'PUT',
				params: {
					id: 1
				}
			});

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(500);

					var err = httpRes._getData();
					should.exist(err);
					err.name.should.equal('Internal Server Error');
					err.message.should.equal('User details is not provided.');

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.updateUser(httpReq, httpRes);
		});

		it('should respond with error message & status code if user is not found.', function (done) {
			const TESTUSERID = 12345;
			httpReq = createRequest({
				method: 'PUT',
				params: {
					id: TESTUSERID
				},
				body: testUsers[1]
			});

			userModelMock
				.expects('findByIdAndUpdate').withArgs(TESTUSERID, userDetailsWithoutUniqueFields, { new: true, runValidators: true })
				.chain('exec')
				.resolves(null);

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(404);

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.updateUser(httpReq, httpRes);

		});

		it('should respond with error message & status code for db exceptions', function (done) {
			const TESTUSERID = 1;
			httpReq = createRequest({
				method: 'PUT',
				params: {
					id: TESTUSERID
				},
				body: testUsers[1]
			});

			userModelMock
				.expects('findByIdAndUpdate').withArgs(TESTUSERID, userDetailsWithoutUniqueFields, { new: true, runValidators: true })
				.chain('exec')
				.rejects({ name: 'MongoError', code: 1 });

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(500);

					var err = httpRes._getData();
					should.exist(err);
					err.name.should.equal('MongoError');

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.updateUser(httpReq, httpRes);
		});
	});

	context('remove user', function () {
		var userModelMock;

		beforeEach(function () {
			userModelMock = sinon.mock(UserModel);
		});

		afterEach(function () {
			userModelMock.verify();
			userModelMock.restore();
		});

		it('should respond with status code', function (done) {
			const TESTUSERID = mongoose.Types.ObjectId(1);
			httpReq = createRequest({
				method: 'DELETE',
				params: {
					id: TESTUSERID
				}
			});

			userModelMock
				.expects('findByIdAndRemove').withArgs(TESTUSERID)
				.chain('exec')
				.resolves(testUsers[0]);

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(204);

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.removeUser(httpReq, httpRes);
		});

		it('should respond with error message & status code if user id is not provided', function (done) {
			httpReq = createRequest({
				method: 'DELETE'
			});

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(500);

					var err = httpRes._getData();
					should.exist(err);
					err.name.should.equal('Internal Server Error');
					err.message.should.equal('UserId is not provided.');

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.removeUser(httpReq, httpRes);
		});

		it('should respond with error message status code if user is not found.', function (done) {
			const TESTUSERID = mongoose.Types.ObjectId(1);
			httpReq = createRequest({
				method: 'DELETE',
				params: {
					id: TESTUSERID
				}
			});

			userModelMock
				.expects('findByIdAndRemove').withArgs(TESTUSERID)
				.chain('exec')
				.resolves(null);

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(404);

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.removeUser(httpReq, httpRes);
		});

		it('should respond with error message & status code for db exceptions', function (done) {
			const TESTUSERID = mongoose.Types.ObjectId(1);
			httpReq = createRequest({
				method: 'DELETE',
				params: {
					id: TESTUSERID
				}
			});

			userModelMock
				.expects('findByIdAndRemove').withArgs(TESTUSERID)
				.chain('exec')
				.rejects({ name: 'MongoError', code: 1 });

			httpRes.on('end', () => {
				try {
					httpRes.statusCode.should.equal(500);

					var err = httpRes._getData();
					should.exist(err);
					err.name.should.equal('MongoError');

					done();
				} catch (err) {
					done(err);
				}
			});

			const userCtrl = new UserController();
			userCtrl.removeUser(httpReq, httpRes);
		});
	});
});

