import mongoose from 'mongoose';

import { logger } from '../../config/app-logger';

var UserSchema = new mongoose.Schema({
    username: {
	type: String,
	required: [ true, 'Username is mandatory!'],
	minlength: [ 5, 'Username should be at least 5 characters long.' ],
	maxlength: [ 20, 'Username should not be more than 20 characters long.' ]
    },
    email: String,
    firstName: String,
    lastName: String,
    password: String,
    status: String
});

UserSchema.path('username').validate({
    isAsync: true,
    validator: function(value, cb) {
	logger.debug('Inside username unique validator with username: ', value);

	mongoose.model('User', UserSchema)
	    .count({ username: value })
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

module.exports.UserModel = mongoose.model('User', UserSchema);
module.exports.UserSchema = UserSchema;

