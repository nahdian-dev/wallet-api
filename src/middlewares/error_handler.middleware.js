const CustomApiError = require("../utilities/CustomApiError");

const errorConverter = (err, res, req, next) => {
    let error = err;

    if (!(error instanceof CustomApiError)) {
        const statusCode = error.statusCode || 500;
        error = new CustomApiError(statusCode, error.message);
    }
    next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    const response = {
        is_success: false,
        status_code: statusCode,
        remark: message,
        stack: err.stack
    };

    res.status(statusCode).send(response);
};

module.exports = { errorConverter, errorHandler };