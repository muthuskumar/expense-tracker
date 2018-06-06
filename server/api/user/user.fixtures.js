export const testUsers = Object.freeze([
	{
		username: 'testuser1',
		email: 'testuser1@test.com',
		password: 'Test@123',
		firstName: 'test',
		lastName: 'user one'
	},
	{
		username: 'testuser2',
		email: 'testuser2@test.com',
		password: 'Test@123',
		firstName: 'test',
		lastName: 'user two'
	},
	{
		username: 'testuser3',
		email: 'testuser3@test.com',
		password: 'Test@123',
		firstName: 'test',
		lastName: 'user three',
		status: 'DEACTIVATED'
	},
	{
		username: 'testuser4',
		email: 'testuser4@test.com',
		password: 'Test@123',
		firstName: 'test',
		lastName: 'user four'
	},
	{
		username: 'testuser5',
		email: 'testuser5@test.com',
		password: 'Test@123',
		firstName: 'test',
		lastName: 'user five',
		status: 'DEACTIVATED'
	}

export const testValidUser = Object.freeze({
	username: 'testuser1',
	email: 'testuser1@test.com',
	password: 'Test@123',
	firstName: 'test',
	lastName: 'user one'
});

export const testUserWithoutUsername = Object.freeze({
	email: 'testuser1@test.com',
	password: 'Test@123',
	firstName: 'test',
	lastName: 'user one'
});

export const testInvalidUser = Object.freeze({
	username: 'test',
	email: 'nottherightformat',
	firstName: 'contains1',
	lastName: 'contains@'
});

export const testUpdatedUser = Object.freeze({
	username: 'testuser1',
	email: 'testuser2@test.com',
	password: 'Test@123',
	firstName: 'test',
	lastName: 'user two'
});

export const testInvalidId = '5abbeb40404d8c2d7cf4bcca';

