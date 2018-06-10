import express from 'express';
import passport from 'passport';

import UserIdTokenSerializer from '../serializers/userId-token.serializer';

var router = express.Router();
var authOptions = {
    session: false,
    failWithError: true
};
var userIdTokenSerializer = new UserIdTokenSerializer();

router.post('/', passport.authenticate('basic', authOptions), userIdTokenSerializer.middlewareFn);

module.exports = router;
