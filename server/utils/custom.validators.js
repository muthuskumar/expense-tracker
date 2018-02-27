module.exports.isSpecialChar = function(str) {
    var regExp = new RegExp(/^[a-zA-Z0-9]+$/);
    return regExp.test(str);
}
