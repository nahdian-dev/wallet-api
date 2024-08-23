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
const AccountController = require('../controllers/account.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Instance
const router = express.Router();

// AUTHENTICATION
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.post('/auth/reset-password', AuthController.resetPassword);
router.get('/auth/verify-email/:token', AuthController.verifyEmail);
router.post('/auth/resend-verify-email', AuthController.resendVerifyEmail);

// BANK
router.post('/account/create-account', authMiddleware, AccountController.createAccount);
router.get('/account/list-detail-account', authMiddleware, AccountController.getAccountByUserId);
router.put('/account/update-detail-account/:id', authMiddleware, AccountController.updateAccountByUserId);
router.delete('/account/delete-detail-account/:id', authMiddleware, AccountController.deleteAccountByUserId);

module.exports = router;