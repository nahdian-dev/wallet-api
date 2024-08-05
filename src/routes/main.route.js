const express = require("express");
const UsersController = require('../controllers/users_controller');

// Instance
const router = express.Router();

// AUTHENTICATION
router.get('/users/login', UsersController.login)

module.exports = router;