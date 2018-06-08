const VALIDATION_MESSAGES = Object.freeze({
    BASIC_AUTH_DETAILS_UNAVAILABLE: 'Basic auth details not provided.',
    AUTH_HEADER_UNAVAILABLE: 'Authorization header is not provided.',
    USERNAME_UNAVAILABLE: 'Username not provided.',
    PASSWORD_UNAVAILABLE: 'Password not provided.',
    JWT_SECRET_UNAVAILABLE: 'JWT secret unavailable',
    USERID_UNAVAILABLE: 'User Id not provided.',
    TOKEN_UNAVAILABLE: 'Token not provided.',
    SERIALIZER_UNAVAILABLE: 'Output Serializer is not provided.'
});

const AUTH_ERR_MESSAGES = Object.freeze({
    AUTH_FAILED: 'Authorization failed.',
    USER_NOT_FOUND: 'User with username not found.',
    INVALID_PASSWORD: 'Invalid Password.',
    INVALID_TOKEN: 'Invalid Token.'
});

module.exports = {
    VALIDATION_MESSAGES: VALIDATION_MESSAGES,
    AUTH_ERR_MESSAGES: AUTH_ERR_MESSAGES
}
