import express from 'express';
import AuthController from './auth.controller';

var router = express.Router();
var authController = new AuthController();

router.post('/', authController.authenticateUser);

module.exports = router;
