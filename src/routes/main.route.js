const express = require("express");
const UsersController = require('../controllers/users_controller');

// Instance
const router = express.Router();

// AUTHENTICATION
router.post('/users/login', UsersController.login);
router.post('/users/register', UsersController.register);

module.exports = router;