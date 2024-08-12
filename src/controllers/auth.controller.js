const bcrypt = require('bcryptjs');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Users = require('../models/users.model');
const sendMail = require('../config/mailer.config');
const forgotPasswordContent = require('../utilities/html/forgot_password_content.utilities');
const { sendSuccessResponse, sendErrorResponse, sendErrorValidationResponse } = require('../utilities/responses.utilities');

// @desc POST login
// @route POST - /auth/login
// @access public
const login = async (req, res) => {
    const { email, password } = req.body;
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(12).required()
    });

    // HANDLE VALIDATION BODY
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            "status": "error",
            "message": "Validation failed",
            "errors": [
                {
                    "message": error.details[0].message,
                }
            ]
        });
    }

    const user = await Users.findOne({ email });

    // CHECK EMAIL IS ALREADY
    if (!user) {
        return res.status(400).json({
            "status": "error",
            "message": "Login failed",
            "errors": [
                {
                    "field": "email",
                    "message": "Email not found!"
                }
            ]
        });
    }

    // PASSWORD COMPARE
    const compare = await bcrypt.compare(password, user.password);
    if (compare) {
        const accessToken = jwt.sign({
            user: {
                username: user.name,
                email: user.email,
                id: user._id
            }
        },
            process.env.SECRET_KEY_TOKEN,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            status: "succes",
            accessToken: accessToken
        });
    } else {
        return res.status(400).json({
            "status": "error",
            "message": "Login failed",
            "errors": [
                {
                    "field": "password",
                    "message": "Password not match!"
                }
            ]
        });
    }
}

// @desc POST Register
// @route POST - /auth/register
// @access public
const register = async (req, res) => {
    const { username, email, password } = req.body;
    const schema = Joi.object({
        username: Joi.string().min(4).max(16).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(16).required(),
    });

    // HANDLE VALIDATION BODY
    const { error } = schema.validate(req.body);
    if (error) {
        sendErrorValidationResponse(res, error.details[0].message, 400);
    }

    // HANDLE DUPLICATE EMAIL
    const alreadyEmail = await Users.findOne({ email });
    if (alreadyEmail) {
        sendErrorResponse(res, 'Error Register Account', { "message": "Email has been registered" }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await Users.create({
            username,
            email,
            password: hashedPassword,
            reset_password_token: null,
            reset_password_expires: null,
            is_verified: 0
        });

        // EMAIL CONTENT
        const to = email;
        const subject = 'Test Email';
        const text = 'This is a test email';
        const html = `<a href="${req.protocol}://${req.get('host')}/auth/verify-email/${user.id}">Pencet</a>`;

        console.log("LINK: " + html);
        await sendMail(to, subject, text, html);

        sendSuccessResponse(res, 'Success Register Account', user, 201);
    } catch (error) {
        sendErrorResponse(res, 'Error Register Account', error, 400);
    }
}

// @desc POST Register
// @route POST - /auth/forgot-password
// @access public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const schema = Joi.object({
        email: Joi.string().email().required(),
    });

    // HANDLE VALIDATION BODY
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            "status": "error",
            "message": "Validation Failed",
            "errors": [
                {
                    "message": error.details[0].message
                }
            ]
        });
    }

    // HANDLE EMAIL NOT FOUND
    const user = await Users.findOne({ email });
    if (!user) {
        return res.status(400).json({
            "status": "error",
            "message": "Email not found",
            "errors": [
                {
                    "field": "email",
                    "message": "The email address you entered is not associated with any account."
                }
            ]
        });
    }

    //GENERATE TOKEN
    user.generatePasswordReset();
    await user.save();

    // EMAIL CONTENT
    const to = email;
    const subject = 'Test Email';
    const text = 'This is a test email';
    const html = forgotPasswordContent(user.username, user.resetPasswordToken, user.resetPasswordExpires);

    // SEND EMAIL
    try {
        await sendMail(to, subject, text, html);
    } catch (err) {
        return res.status(400).json({
            "status": "error",
            "message": "Error send email",
            "errors": [
                {
                    "to": email,
                    "message": err
                }
            ]
        });
    }

    return res.status(200).json({
        "status": "success",
        "message": "Email sent",
        "errors": [
            {
                "to": email,
                "token": user.resetPasswordToken,
                "expired_token": user.resetPasswordExpires,
                "message": "Success send email"
            }
        ]
    });
}

// @desc POST Reset Password
// @route POST - /auth/reset-password
// @access public
const resetPassword = async (req, res) => {
    const { token, email, new_password } = req.body;
    const schema = Joi.object({
        token: Joi.string().required(),
        email: Joi.string().email().required(),
        new_password: Joi.string().min(4).max(12).required()
    });

    // HANDLE VALIDATION BODY
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            "status": "error",
            "message": "Validation Failed",
            "errors": [
                {
                    "message": error.details[0].message
                }
            ]
        });
    }

    // HASHED PASSWORD
    const hashedPassword = await bcrypt.hash(new_password, 10);
    try {
        const user = await Users.findOneAndUpdate(
            {
                email: email,
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() },
            },
            {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
            {
                new: true
            }
        );

        if (!user) {
            return res.status(400).json({
                "status": "error",
                "message": "Reset password error",
                "errors": [
                    {
                        "message": "Password reset token is invalid or has expired"
                    }
                ]
            });
        }

        return res.status(200).json({
            "status": "success",
            "message": "Reset password success",
            "errors": [
                {
                    "message": "Success reset password"
                }
            ]
        });

    } catch (err) {
        return res.status(400).json({
            "status": "error",
            "message": "Reset password error",
            "errors": [
                {
                    "message": err
                }
            ]
        });
    }
}

// @desc POST Reset Password
// @route POST - /auth/reset-password
// @access public
const verifyEmail = async (req, res) => {

    try {
        await Users.replaceOne(
            {
                _id: mongoose.Types.ObjectId(req.params.id),
            },
            {
                is_verified: 1,
            }
        );

    } catch (err) {
        sendErrorResponse(res, 'Error Verify Email', err, 400);
    }
}

module.exports = { login, register, forgotPassword, resetPassword, verifyEmail }