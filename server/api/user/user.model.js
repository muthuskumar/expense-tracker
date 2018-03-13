import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import owasp from 'owasp-password-strength-test';

import { noSpecialCharValidationRegex, numberValidationRegex, emailFormatValidationRegex } from '../../utils/custom.validators';
import { logger } from '../../config/app-logger';

const STATUSES = ['ACTIVE', 'DEACTIVATED'];

var nameValidator = [
    {
	validator: function(name) {
	    return noSpecialCharValidationRegex.test(name);
	},
	message: 'Name cannot contain special characters.'
    },
    {
	validator: function(name) {
	    logger.debug('Inside number validation for: ', name);

	    logger.debug('Name contains number: ', numberValidationRegex.test(name));
	    return !numberValidationRegex.test(name);
	},
	message: 'Name cannot contain numbers.'
    }
];

var UserSchema = new mongoose.Schema({
    username: {
	type: String,
	required: [ true, 'Username is mandatory!'],
	lowercase: true,
	minlength: [ 5, 'Username should be at least 5 characters long.' ],
	maxlength: [ 20, 'Username should not be more than 20 characters long.' ]
    },
    email: {
	type: String,
	required: [ true, 'email is mandatory!' ],
	match: [ emailFormatValidationRegex, 'email id is not of correct format.' ]
    },
    firstName: {
	type: String,
	required: [ true, 'First name is mandatory!' ],
	validate: nameValidator
    },
    lastName: {
	type: String,
	required: [ true, 'Last name is mandatory!' ],
	validate: nameValidator
    },
    password: {
	type: String,
	required: [ true, 'Password is mandatory!']
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

UserSchema.virtual('fullname')
    .get(function() {
	const firstName = this.firstName ? this.firstName : '';
	const lastName = this.lastName ? this.lastName : '';
	const separator = firstName && lastName ? ' ' : '';
	
	return firstName + separator + lastName;
    });


UserSchema.pre('validate', function(next) {
    logger.debug('Inside pre validator');

    owasp.config({
	allowPassphrases       : false,
	maxLength              : 15,
	minLength              : 8,
	minPhraseLength        : 20,
	minOptionalTestsToPass : 4,
    });

    var validationError;
    var results = owasp.test(this.password);

    logger.debug('Validation results errors: ', results.errors);

    if (results.errors.length) {
	var err = results.errors.join('\n');
	logger.debug('Joined error: \n', err);
	validationError = this.invalidate('password', err);
    }
    
    next(validationError);
    
    logger.debug('End of pre validator');
});

UserSchema.methods = {
    authenticate: function(plainTextPassword) {
	return bcrypt.compareSync(plainTextPassword, this.password);
    },
    encryptPassword: function(plainTextPassword) {
	if (!plainTextPassword) {
	    return '';
	} else {
	    var salt = bcrypt.genSaltSync(10);
	    return bcrypt.hashSync(plainTextPassword, salt);
	}
    }
}


UserSchema._middlewareFunctions = {
    encryptPassword: function(next) {
	logger.debug('Inside validate function');
	logger.debug('Is password modified: ', this.isModified('password'));
	
	if(this.isModified('password'))
	    this.password = this.encryptPassword(this.password);

	logger.debug('Encrypted Password: ', this.password );

	next();
    }
};
UserSchema.pre('save', UserSchema._middlewareFunctions.encryptPassword);

module.exports.UserModel = mongoose.model('User', UserSchema);
module.exports.UserSchema = UserSchema;

