const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');

router.post('/register', userController.createUser);
router.get('/all-users', userController.getAllUsers);
router.post('/login', userController.login);
router.put('/change-password', userController.changePassword);

module.exports = router;
