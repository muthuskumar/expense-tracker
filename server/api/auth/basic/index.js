import express from 'express';
import AuthController from './auth.controller';

var router = express.Router();
var controller = new AuthController();

router.post('/', controller.authenticateUser);

module.exports = router;
