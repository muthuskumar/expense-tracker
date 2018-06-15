const ERROR_NAME = 'ValidationError';

export default class ValidationError extends Error {
    constructor(path, message) {
	super(message);
	this.name = ERROR_NAME;
	this.path = path;
    }
}

module.exports.errorName = ERROR_NAME;

