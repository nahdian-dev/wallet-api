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

const AuthController = require('../controllers/auth.controller');
const BankController = require('../controllers/bank.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Instance
const router = express.Router();

// AUTHENTICATION
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.post('/auth/reset-password', AuthController.resetPassword);

// BANK
router.get('/bank/create-bank', authMiddleware, BankController.createBank);

module.exports = router;