import express from 'express';
import UserController from './user.controller';

var router = express.Router();
var controller = new UserController();

router.get('/', controller.getUsers);
router.post('/', controller.createUser);

module.exports = router;
