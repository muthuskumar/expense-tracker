const ERROR_NAME = 'AuthorizationError';

export default class AuthorizationError extends Error {
    constructor(message) {
	super(message);
	this.name = ERROR_NAME;
    }
}

module.exports.errorName = ERROR_NAME;
