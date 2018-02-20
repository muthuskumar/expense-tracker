import mongoose from 'mongoose';

//import { logger } from '../../config/app-logger';

var UserSchema = new mongoose.Schema({
    username: {
	type: String,
	required: [ true, 'Username is mandatory!'],
	minlength: [ 5, 'Username should be at least 5 characters long.' ],
	maxlength: [ 10, 'Username should not be more than 10 characters long.' ]
    },
    email: String,
    firstName: String,
    lastName: String,
    password: String,
    status: String
});

module.exports = mongoose.model('User', UserSchema);
