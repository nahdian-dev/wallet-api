const sendSuccessResponse = (res, message, data = {}, statusCode) => {
    res.status(statusCode).json({
        "success": true,
        "status": "success",
        "status_code": statusCode,
        "message": message,
        "data": data
    });
}

const sendErrorResponse = (res, message, errors = {}, statusCode) => {
    res.status(statusCode).json({
        "success": false,
        "status": "error",
        "status_code": statusCode,
        "message": message,
        "error": errors
    });
}

const sendErrorValidationResponse = (res, errors = {}, statusCode) => {
    res.status(statusCode).json({
        "success": false,
        "status": "error",
        "status_code": statusCode,
        "message": 'Error Validation',
        "validation_error": errors
    });
}

module.exports = {
    sendSuccessResponse,
    sendErrorResponse,
    sendErrorValidationResponse
}