const jwt = require('jsonwebtoken');

const Responses = require('../utilities/responses.utilities')

const authMiddleware = async (req, res, next) => {
    const header = req.header('Authorization');
    if (!header) {
        return Responses.sendErrorValidationResponse(res, 'Access denied. No token provided.', 401);
    }

    try {
        const token = header.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.SECRET_KEY_TOKEN);
        req.userId = decoded.user.id;
        next();
    } catch (error) {
        console.error(error);
        return Responses.sendErrorValidationResponse(res, error.message, 401);
    }
};

module.exports = authMiddleware;