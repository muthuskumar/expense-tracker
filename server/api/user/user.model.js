import mongoose from 'mongoose';

import { containsSpecialChar } from '../../utils/custom.validators';
import { logger } from '../../config/app-logger';

const STATUSES = ['ACTIVE', 'DEACTIVATED'];

var UserSchema = new mongoose.Schema({
    username: {
	type: String,
	required: [ true, 'Username is mandatory!'],
	minlength: [ 5, 'Username should be at least 5 characters long.' ],
	maxlength: [ 20, 'Username should not be more than 20 characters long.' ]
    },
    email: {
	type: String,
	required: [ true, 'email is mandatory!' ]
    },
    firstName: {
	type: String,
	required: [ true, 'First name is mandatory!' ]
    },
    lastName: {
	type: String,
	required: [ true, 'Last name is mandatory!' ]
    },
    password: {
	type: String,
	required: [ true, 'Password is mandatory!'],
	minlength: [ 8, 'Password should be at least 8 characters long.' ],
	maxlength: [ 15, 'Password should not be more than 15 characters long.' ]
    },
    status: {
	type: String,
	enum: ['ACTIVE', 'DEACTIVATED'],
	default: STATUSES[0]
    }
});

UserSchema.path('username').validate({
    isAsync: true,
    validator: function(username, cb) {
	logger.debug('Inside username unique validator with username: ', username);

	mongoose.model('User', UserSchema)
	    .count({ username: username })
	    .then((count) => {
		logger.debug("Username count: ", count);
		cb(!count);
	    })
	    .catch((err) => {
		logger.error("An error occurred while retrieving count - ", err);
		cb(false);
	    });

	logger.debug('End of count validator');
    },
    message: 'Username is already registered.' });

UserSchema.path('email').validate({
    validator: function(email) {
	logger.debug('Inside email format validator with email: ', email);

	const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
	
	logger.debug('email id is: ', regExp.test(email));
	logger.debug('End of email validity validator');

	return regExp.test(email);
    },
    message: 'email id is not of correct format.'});

UserSchema.path('email').validate({
    isAsync: true,
    validator: function(email, cb) {
	logger.debug('Inside email unique validator with email: ', email);

	mongoose.model('User', UserSchema)
	    .count({ email: email })
	    .then((count) => {
		logger.debug('email count: ', count);
		cb(!count);
	    })
	    .catch((err) => {
		logger.error("An error occurred while retrieving count - ", err);
		cb(false);
	    });

	logger.debug('End of count validator');
    },
    message: 'email is already registered.' });

UserSchema.path('firstName').validate({
    validator: function(firstName) {
	logger.debug('Inside first name validation: ', firstName);

	logger.debug('First name is ', containsSpecialChar(firstName));

	return containsSpecialChar(firstName);
    },
    message: 'First name cannot contain special characters.'
});

UserSchema.path('lastName').validate({
    validator: function(lastName) {
	logger.debug('Inside last name validation: ', lastName);

	logger.debug('Last name is ', containsSpecialChar(lastName));

	return containsSpecialChar(lastName);
    },
    message: 'Last name cannot contain special characters.'
});

UserSchema.path('password').validate({
    validator: function(password) {
	logger.debug('Inside password format validator with password: ', password);

	const regExp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,15})/);
	
	logger.debug('password id is: ', regExp.test(password));
	logger.debug('End of password validity validator');

	return regExp.test(password);
    },
    message: 'Password should contain at least a uppercase character, a lowercase character, a number and a special character.'});

UserSchema.virtual('fullname').get(function() {
    const firstName = this.firstName ? this.firstName : '';
    const lastName = this.lastName ? this.lastName : '';
    const separator = firstName && lastName ? ' ' : '';
    
    return firstName + separator + lastName;
});

module.exports.UserModel = mongoose.model('User', UserSchema);
module.exports.UserSchema = UserSchema;

