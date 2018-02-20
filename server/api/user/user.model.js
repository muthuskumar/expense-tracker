import mongoose from 'mongoose';

//import { logger } from '../../config/app-logger';

var UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: String,
    firstName: String,
    lastName: String,
    password: String,
    status: String
});

module.exports = mongoose.model('User', UserSchema);
