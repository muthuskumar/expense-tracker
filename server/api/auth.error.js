const ERROR_NAME = 'AuthError';

export default class AuthError extends Error {
    constructor(message) {
        super(message);
        this.name = ERROR_NAME;
    }
}

module.exports.errorName = ERROR_NAME;
