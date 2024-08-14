const jwt = require('jsonwebtoken');

const Responses = require('../utilities/responses.utilities')
const User = require('../models/users.model');

const authMiddleware = async (req, res, next) => {
    const header = req.header('Authorization');
    if (!header) {
        return Responses.sendErrorValidationResponse(res, 'Access Denied', 'Access denied. No token provided.', 401);
    }

    try {
        const token = header.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.SECRET_KEY_TOKEN);
        req.user = await User.findById(decoded._id);
        next();
    } catch (error) {
        return Responses.sendErrorValidationResponse(res, 'Invalid Token', error, 401);
    }
};

module.exports = authMiddleware;