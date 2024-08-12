const { sendErrorResponse } = require('../utilities/responses.utilities');

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Something went wrong on the server.' : err.message;

    sendErrorResponse(res, message, err, statusCode);
};

module.exports = { errorHandler };