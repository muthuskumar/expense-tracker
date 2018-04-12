const VALIDATION_MESSAGES = Object.freeze({
    ERROR_TYPE_INTERNAL_SERVER: 'Internal Server Error',
    ERROR_TYPE_UNAUTHORIZED_USER: 'Unauthorized User',
    AUTH_DETAILS_NOT_PROVIDED: 'Authorization details are not provided.',
    AUTH_DETAILS_INVALID: 'Invalid authorization details provided.',
    JWT_SECRET_UNAVAILABLE: 'JWT secret unavailable',
    AUTH_FAILED: 'Authorization failed.',
    USERID_UNAVAILABLE: 'User Id not provided.',
    TOKEN_UNAVAILABLE: 'Token not provided.'
});

module.exports = {
    VALIDATION_MESSAGES: VALIDATION_MESSAGES
}
