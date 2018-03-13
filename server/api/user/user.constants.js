const STATUSES = Object.freeze([ 'ACTIVE', 'DEACTIVATED' ]);

const VALIDATION_MESSAGES = Object.freeze({
    USERNAME_MANDATORY: 'Username is mandatory!',
    USERNAME_MINLENGTH: 'Username should be at least 5 characters long.',
    USERNAME_MAXLENGTH: 'Username should not be more than 20 characters long.',
    USERNAME_UNAVAILABLE: 'Username is already registered.',
    EMAIL_MANDATORY: 'email is mandatory!',
    EMAIL_BADFORMAT: 'email id is not of correct format.',
    EMAIL_UNAVAILABLE: 'email is already registered.',
    FIRST_NAME_MANDATORY: 'First name is mandatory!',
    LAST_NAME_MANDATORY: 'Last name is mandatory!',
    NAME_SPECIALCHAR: 'Name cannot contain special characters.',
    NAME_NUMBERS: 'Name cannot contain numbers.',
    PASSWORD_MANDATORY: 'Password is mandatory!',
    PASSWORD_MINLENGTH: 'The password must be at least 8 characters long.',
    PASSWORD_MAXLENGTH: 'The password must be fewer than 15 characters.',
    PASSWORD_UPPERCASE: 'The password must contain at least one uppercase letter.',
    PASSWORD_LOWERCASE: 'The password must contain at least one lowercase letter.',
    PASSWORD_SPECIALCHAR: 'The password must contain at least one special character.',
    PASSWORD_NUMBERS: 'The password must contain at least one number.'
});

module.exports = {
    STATUSES: STATUSES,
    VALIDATION_MESSAGES: VALIDATION_MESSAGES
}
