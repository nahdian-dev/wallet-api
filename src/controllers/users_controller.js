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
        password: Joi.string().required()
    });

    const { error, value } = await schema.validate();

    if (error) {
        res.status(400).json({
            status: "error",
            message: error.stack
        });
        throw new Error(error);
    }

    const user = await Users.findOne({ email });
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

        res.status(200).json({
            status: "succes",
            accessToken: accessToken
        });
    } else {
        res.status(400).json({
            status: "error",
            message: "Password not match!"
        });
        throw new Error('Password not match!');
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

    const { error, value } = await schema.validate(req.body);
    if (error) {
        res.status(400);
        throw new Error(error);
    }

    const alreadyEmail = await Users.findOne({ email });
    if (alreadyEmail) {
        res.status(400);
        throw new Error('Email sudah tersedia!');
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    try {
        const createUser = await Users.create({
            username,
            email,
            password: hashedPassword
        });
        res.status(200).json({
            message: "Register successfully!",
            body: createUser
        });
        console.log(email + " register successfully!");
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error
        });
        throw new Error(error);
    }
}

module.exports = { login, register }