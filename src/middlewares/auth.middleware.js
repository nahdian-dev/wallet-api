const jwt = require('jsonwebtoken');

const { sendSuccessResponse, sendErrorServerResponse, sendErrorValidationResponse } = require('../utilities/responses.utilities')
const User = require('../models/users.model');

const authMiddleware = async (req, res, next) => {
    const header = req.header('Authorization');
    if (!header) {
        sendErrorValidationResponse(res, 'Access Denied', 'Access denied. No token provided.', 401);
    }

    try {
        const token = header.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.SECRET_KEY_TOKEN);
        req.user = await User.findById(decoded._id);
        next();
    } catch (error) {
        sendErrorValidationResponse(res, 'Invalid Token', error, 401);
    }
};

module.exports = authMiddleware;