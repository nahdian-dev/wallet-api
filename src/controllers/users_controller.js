const bcrypt = require('bcryptjs');
const Users = require('../models/users_model');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

// @desc POST login
// @route POST - /users/login
// @access public
const login = async (req, res) => {
    const { email, password } = req.body;
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(12).required()
    });

    // HANDLE VALIDATION BODY
    const { error, value } = schema.validate(req.body);
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
// @route POST - /users/register
// @access public
const register = async (req, res) => {
    const { username, email, password } = req.body;
    const schema = Joi.object({
        username: Joi.string().min(4).max(16).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).max(16).required(),
    });

    // HANDLE VALIDATION BODY
    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            "status": "error",
            "message": "Register Failed",
            "errors": [
                {
                    "message": "Email has been registered"
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

module.exports = { login, register }