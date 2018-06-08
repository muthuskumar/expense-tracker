const ERROR_NAME = 'InternalServerError';

export default class InternalServerError extends Error {
    constructor(message) {
        super(message);
        this.name = ERROR_NAME;
    }
}

module.exports.errorName = ERROR_NAME;
