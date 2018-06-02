const VALIDATION_MESSAGES = Object.freeze({
    BASIC_AUTH_DETAILS_UNAVAILABLE: 'Basic auth details not provided.',
    USERNAME_UNAVAILABLE: 'Username not provided.',
    PASSWORD_UNAVAILABLE: 'Password not provided.',
    USER_NOT_FOUND: 'User with username not found.',
    INVALID_PASSWORD: 'Invalid Password.',
    JWT_SECRET_UNAVAILABLE: 'JWT secret unavailable',
    AUTH_FAILED: 'Authorization failed.',
    USERID_UNAVAILABLE: 'User Id not provided.',
    TOKEN_UNAVAILABLE: 'Token not provided.'
});

module.exports = {
    VALIDATION_MESSAGES: VALIDATION_MESSAGES
}
