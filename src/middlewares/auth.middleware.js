const jwt = require('jsonwebtoken');

const Responses = require('../utilities/responses.utilities');
const Users = require('../models/users.model');

const authMiddleware = async (req, res, next) => {
    const header = req.header('Authorization');
    if (!header) {
        return Responses.sendErrorValidationResponse(res, 'Access denied. No token provided.', 401);
    }

    try {
        const token = header.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.SECRET_KEY_TOKEN);
        req.userId = decoded.user.id;

        const user = await Users.findOne(
            {
                _id: decoded.user.id,
            }
        );

        if (user.is_verified === 0) {
            return Responses.sendErrorResponse(res, 'Authentication Failed', { message: 'User has not been verified. Please check your email and verify your account.' }, 400);
        }

        next();
    } catch (error) {
        console.error(error);
        return Responses.sendErrorValidationResponse(res, error.message, 401);
    }
};

module.exports = authMiddleware;