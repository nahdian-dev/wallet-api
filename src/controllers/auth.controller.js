const bcrypt = require('bcryptjs');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const Users = require('../models/users.model');
const sendMail = require('../config/mailer.config');
const forgotPasswordContent = require('../utilities/html/forgot_password_content.utilities');
const Responses = require('../utilities/responses.utilities');

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
        return Responses.sendErrorValidationResponse(res, error, 400);
    }

    const user = await Users.findOne({ email });

    // CHECK EMAIL IS ALREADY
    if (!user) {
        return Responses.sendErrorResponse(res, 'Login Failed', { message: 'User not found' }, 400);
    }

    // CHECK VERIFIED ACCOUNT
    if (user.is_verified == 0) {
        return Responses.sendErrorResponse(res, 'Login Failed', { message: 'User has not been verified. Please check your email and verify your account.' }, 400);
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
            message: "Login Success",
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
        return Responses.sendErrorValidationResponse(res, error.details[0].message, 400);
    }

    // HANDLE DUPLICATE EMAIL
    const user = await Users.findOne({ email });
    if (user) {
        return Responses.sendErrorResponse(res, 'Error Register Account', { "message": "Email has been registered" }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await Users.create({
            username,
            email,
            password: hashedPassword,
            reset_password_otp: null,
            reset_password_expires: null,
            is_verified: 0
        });

        //GENERATE TOKEN
        user.generateTokenVerifyEmail();
        await user.save();

        // EMAIL CONTENT
        const to = email;
        const subject = 'Test Email';
        const text = 'This is a test email';
        const html = `<a href="${req.protocol}://${req.get('host')}/auth/verify-email/${user.verify_email_token}">Pencet</a>`;

        await sendMail(to, subject, text, html);

        return Responses.sendSuccessResponse(res, 'Success Register Account', user, 201);
    } catch (error) {
        return Responses.sendErrorResponse(res, 'Error Register Account', error, 400);
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
        return Responses.sendErrorValidationResponse(res, error, 400);
    }

    // HANDLE EMAIL NOT FOUND
    const user = await Users.findOne({ email });
    if (!user) {
        return Responses.sendErrorResponse(res, 'Email not found', { message: "'The email address you entered is not associated with any account.'" }, 400);
    }

    // CHECK VERIFIED ACCOUNT
    if (user.is_verified == 0) {
        return Responses.sendErrorResponse(res, 'Login Failed', { message: 'User has not been verified. Please check your email and verify your account.' }, 400);
    }

    //GENERATE TOKEN
    user.generatePasswordReset();
    await user.save();

    // EMAIL CONTENT
    const to = email;
    const subject = 'Test Email';
    const text = 'This is a test email';
    const html = forgotPasswordContent(user.username, user.reset_password_otp, user.resetPasswordExpires);

    // SEND EMAIL
    try {
        await sendMail(to, subject, text, html);
    } catch (err) {
        return Responses.sendErrorResponse(res, 'Error Send Email', err, 400);
    }

    return Responses.sendSuccessResponse(res, 'Email Sent', {
        "to": email,
        "otp": user.reset_password_otp,
        "expired_otp": user.reset_password_expires
    }, 200);
}

// @desc POST Reset Password
// @route POST - /auth/reset-password
// @access public
const resetPassword = async (req, res) => {
    const { otp, email, new_password } = req.body;
    const schema = Joi.object({
        otp: Joi.string().required(),
        email: Joi.string().email().required(),
        new_password: Joi.string().min(4).max(12).required()
    });

    // HANDLE VALIDATION BODY
    const { error } = schema.validate(req.body);
    if (error) {
        return Responses.sendErrorValidationResponse(res, error, 400);
    }

    // HASHED PASSWORD
    const hashedPassword = await bcrypt.hash(new_password, 10);
    try {
        const user = await Users.findOneAndUpdate(
            {
                email: email,
                reset_password_otp: otp,
                reset_password_expires: { $gt: Date.now() },
            },
            {
                password: hashedPassword,
                reset_password_otp: null,
                reset_password_expires: null,
            },
            {
                new: true
            }
        );

        if (!user) {
            return Responses.sendErrorResponse(res, 'Reset Password Error', { 'message': 'Password reset token is invalid or has expired' }, 400);
        }

        // CHECK VERIFIED ACCOUNT
        if (user.is_verified == 0) {
            return Responses.sendErrorResponse(res, 'Login Failed', { message: 'User has not been verified. Please check your email and verify your account.' }, 400);
        }

        // CHECK VERIFIED ACCOUNT
        if (user.is_verified == 0) {
            return Responses.sendErrorResponse(res, 'Login Failed', { message: 'User has not been verified. Please check your email and verify your account.' }, 400);
        }

        return Responses.sendSuccessResponse(res, 'Reset Password Success', {
            email: email,
            reset_password_otp: otp,
            resetPasswordExpires: { $gt: Date.now() },
        }, 200);
    } catch (err) {
        return Responses.sendErrorResponse(res, 'Error Reset Password', err, 400);
    }
}

// @desc GET Verify Email
// @route GET - /auth/verify-email/:token
// @access public
const verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const updatedUser = await Users.findOneAndUpdate(
            {
                verify_email_token: token
            },
            {
                is_verified: 1,
                verify_email_token: null,
                verify_email_token_expires: null
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedUser) {
            return res.status(400).render('verify_email/expired_response_views');
        }

        return res.render('verify_email/success_response_views', { user: updatedUser });
    } catch (err) {
        return res.status(400).render('verify_email/error_response_views');
    }
}

// @desc POST Resend Verify Email
// @route POST - /auth/resend-verify-email
// @access public
const resendVerifyEmail = async (req, res) => {
    const { email } = req.body;

    // HANDLE VALIDATION BODY
    const { error } = schema.validate(req.body);
    if (error) {
        return Responses.sendErrorValidationResponse(res, error.details[0].message, 400);
    }

    // FIND USER
    const user = await Users.findOne({ email });
    if (!user) {
        return Responses.sendErrorResponse(res, 'Error Resend Verify Email', { "message": "Email has not been registered" }, 400);
    }

    // CHECK USER IS VERIFIED
    if (user.is_verified === 1) {
        return Responses.sendErrorResponse(res, 'Error Resend Verify Email', { "message": "Email has been verified" }, 400);
    }

    try {
        //GENERATE TOKEN
        user.generateTokenVerifyEmail();
        await user.save();

        // EMAIL CONTENT
        const to = email;
        const subject = 'Test Email';
        const text = 'This is a test email';
        const html = `<a href="${req.protocol}://${req.get('host')}/auth/verify-email/${user.verify_email_token}">Pencet</a>`;

        await sendMail(to, subject, text, html);

        return Responses.sendSuccessResponse(res, 'Success Resend Verify Email', user, 201);
    } catch (error) {
        return Responses.sendErrorResponse(res, 'Error Resend Verify Email', error, 400);
    }



}

module.exports = { login, register, forgotPassword, resetPassword, verifyEmail, resendVerifyEmail }