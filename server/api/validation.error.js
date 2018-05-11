const ERROR_NAME = 'ValidationError';

export default class ValidationError extends Error {
    constructor(message) {
	super(message);
	this.name = ERROR_NAME;
    }
}
