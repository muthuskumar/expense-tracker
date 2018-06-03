import express from 'express';
import AuthController from './auth.controller';

var router = express.Router();
var authController = new AuthController();

/*authController uses 'this' within the code. Hence it needs to be binded to itself
while setting up the route. Otherwise 'this' will be undefined.*/
router.post('/', authController.authenticateUser.bind(authController));

module.exports = router;
