const bcrypt = require('bcryptjs');
const Users = require('../models/users_model');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const sendMail = require('../config/mailer_config');
const forgotPasswordContent = require('../utilities/html/forgot_password_content');

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
        const accessToken = await jwt.sign({
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

    // HANDLE DUPLICATE EMAIL
    const alreadyEmail = await Users.findOne({ email });
    if (alreadyEmail) {
        return res.status(400).json({
            "status": "error",
            "message": "Register Failed",
            "errors": [
                {
                    "field": "email",
                    "message": "Email has been registered"
                }
            ]
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const createUser = await Users.create({
            username,
            email,
            password: hashedPassword
        });

        return res.status(201).json({
            "status": "success",
            "message": "Register Success",
            "data": createUser
        });
    } catch (error) {
        return res.status(400).json({
            "status": "error",
            "message": "Register Failed",
            "errors": [
                {
                    "message": error
                }
            ]
        });
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

module.exports = { login, register, forgotPassword, resetPassword }