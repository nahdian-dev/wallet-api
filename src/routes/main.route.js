/**
 * @openapi
 * /example:
 *   get:
 *     summary: Retrieve example data
 *     description: Returns example data.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Example data'
 */

const express = require("express");
const UsersController = require('../controllers/users_controller');

// Instance
const router = express.Router();

// AUTHENTICATION
router.post('/users/login', UsersController.login);
router.post('/users/register', UsersController.register);

module.exports = router;