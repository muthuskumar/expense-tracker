import { UserModel } from './user.model';

module.exports.testUsers = Object.freeze([
    new UserModel({
	username: 'testuser1',
	email: 'testuser1@test.com',
	password: 'Test@123',
	firstName: 'test',
	lastName: 'user1'
    }),
    new UserModel({
	username: 'testuser2',
	email: 'testuser2@test.com',
	password: 'Test@123',
	firstName: 'test',
	lastName: 'user2'
    }),
    new UserModel({
	username: 'testuser3',
	email: 'testuser3@test.com',
	password: 'Test@123',
	firstName: 'test',
	lastName: 'user3',
	status: 'DEACTIVATED'
	
    }),
    new UserModel({
	username: 'testuser4',
	email: 'testuser4@test.com',
	password: 'Test@123',
	firstName: 'test',
	lastName: 'user4'
    }),
    new UserModel({
	username: 'testuser5',
	email: 'testuser5@test.com',
	password: 'Test@123',
	firstName: 'test',
	lastName: 'user5',
	status: 'DEACTIVATED'
    })
]);

module.exports.testValidUser = Object.freeze({
    username: 'testuser1',
    email: 'testuser1@test.com',
    password: 'Test@123',
    firstName: 'test',
    lastName: 'user1'});

module.exports.testUserWithoutUsername = Object.freeze({
	email: 'testuser1@test.com',
	password: 'Test@123',
	firstName: 'test',
	lastName: 'user1'
});
