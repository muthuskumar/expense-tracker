var noSpecialCharValidationRegex = /^[a-zA-Z0-9 ]+$/;
var numberValidationRegex = /[0-9]+$/;
var emailFormatValidationRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; /*eslint no-useless-escape: "off" */

module.exports.noSpecialCharValidationRegex = noSpecialCharValidationRegex;
module.exports.numberValidationRegex = numberValidationRegex;
module.exports.emailFormatValidationRegex = emailFormatValidationRegex;
