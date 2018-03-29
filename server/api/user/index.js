import express from 'express';
import UserController from './user.controller';

var router = express.Router();
var controller = new UserController();

router.get('/', controller.getUsers);
router.get('/:id', controller.getUser);
router.post('/', controller.createUser);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.removeUser);

module.exports = router;
