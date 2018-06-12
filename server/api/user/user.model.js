import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import owasp from 'owasp-password-strength-test';

import { noSpecialCharValidationRegex, numberValidationRegex, emailFormatValidationRegex } from '../../utils/custom.validators';
import { STATUSES, VALIDATION_MESSAGES } from './user.constants';

import { logger } from '../../config/app-logger';

var nameValidator = [
	{
		validator: function (name) {
			return noSpecialCharValidationRegex.test(name);
		},
		message: VALIDATION_MESSAGES.NAME_SPECIALCHAR
	},
	{
		validator: function (name) {
			return !numberValidationRegex.test(name);
		},
		message: VALIDATION_MESSAGES.NAME_NUMBERS
	}
];

var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [true, VALIDATION_MESSAGES.USERNAME_MANDATORY],
		lowercase: true,
		minlength: [5, VALIDATION_MESSAGES.USERNAME_MINLENGTH],
		maxlength: [20, VALIDATION_MESSAGES.USERNAME_MAXLENGTH]
	},
	email: {
		type: String,
		required: [true, VALIDATION_MESSAGES.EMAIL_MANDATORY],
		match: [emailFormatValidationRegex, VALIDATION_MESSAGES.EMAIL_BADFORMAT]
	},
	firstName: {
		type: String,
		required: [true, VALIDATION_MESSAGES.FIRST_NAME_MANDATORY],
		validate: nameValidator
	},
	lastName: {
		type: String,
		required: [true, VALIDATION_MESSAGES.LAST_NAME_MANDATORY],
		validate: nameValidator
	},
	password: {
		type: String,
		required: [true, VALIDATION_MESSAGES.PASSWORD_MANDATORY]
	},
	status: {
		type: String,
		enum: STATUSES,
		default: STATUSES[0]
	}
});

UserSchema.path('username').validate({
	isAsync: true,
	validator: function (username, cb) {
		logger.debug('Inside username unique validator with username: ', username);

		mongoose.model('User', UserSchema)
			.count({ username: username })
			.then((count) => {
				logger.debug("Username count: ", count);
				cb(count === 0);
			})
			.catch((err) => {
				logger.error("An error occurred while retrieving count - ", err);
				cb(false);
			});

		logger.debug('End of count validator');
	},
	message: VALIDATION_MESSAGES.USERNAME_UNAVAILABLE
});

UserSchema.path('email').validate({
	isAsync: true,
	validator: function (email, cb) {
		logger.debug('Inside email unique validator with email: ', email);

		mongoose.model('User', UserSchema)
			.count({ email: email })
			.then((count) => {
				logger.debug('email count: ', count);
				cb(count === 0);
			})
			.catch((err) => {
				logger.error("An error occurred while retrieving count - ", err);
				cb(false);
			});

		logger.debug('End of count validator');
	},
	message: VALIDATION_MESSAGES.EMAIL_UNAVAILABLE
});

UserSchema.virtual('fullname')
	.get(function () {
		const firstName = this.firstName ? this.firstName : '';
		const lastName = this.lastName ? this.lastName : '';
		const separator = firstName && lastName ? ' ' : '';

		return firstName + separator + lastName;
	});


UserSchema.pre('validate', function (next) {
	logger.debug('Inside pre validator');

	owasp.config({
		allowPassphrases: false,
		maxLength: 15,
		minLength: 8,
		minPhraseLength: 20,
		minOptionalTestsToPass: 4,
	});

	logger.debug('Password to be validated is: ', this.password);

	var validationError;
	if (this.password) {
		var results = owasp.test(this.password);
		logger.debug('Validation results errors: ', results.errors);

		if (results.errors.length) {
			var err = results.errors.join('\n');
			logger.debug('Joined error: \n', err);
			validationError = this.invalidate('password', err);
		}
	}

	next(validationError);

	logger.debug('End of pre validator');
});

UserSchema.methods = {
	authenticate: function (plainTextPassword) {
		return bcrypt.compareSync(plainTextPassword, this.password);
	},
	encryptPassword: function (plainTextPassword) {
		if (!plainTextPassword) {
			return '';
		} else {
			var salt = bcrypt.genSaltSync(10);
			return bcrypt.hashSync(plainTextPassword, salt);
		}
	}
};

UserSchema._middlewareFunctions = {
	encryptPassword: function (next) {
		logger.debug('Inside encryptPassword function');
		logger.debug('Is password modified: ', this.isModified('password'));

		if (this.isModified('password'))
			this.password = this.encryptPassword(this.password);

		logger.debug('Encrypted Password: ', this.password);

		next();
	}
};

UserSchema.pre('save', UserSchema._middlewareFunctions.encryptPassword);

if (!UserSchema.options.toJSON)
	UserSchema.options.toJSON = {};
UserSchema.options.toJSON.transform = (doc, ret, options) => { // eslint-disable-line no-unused-vars
	delete ret.password;
	return ret;
};

module.exports.UserModel = mongoose.model('User', UserSchema);
module.exports.UserSchema = UserSchema;

