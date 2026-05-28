/**
 * Send a success response
 */
const sendSuccess = (res, statusCode = 200, message = "Success", data = {}) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Send an error response
 */
const sendError = (res, statusCode = 500, message = "Something went wrong", errors = null) => {
    // If statusCode is passed as a string (e.g. sendError(res, error.message)),
    // shift the arguments to keep it backward compatible and prevent RangeError.
    if (typeof statusCode === "string") {
        errors = message;
        message = statusCode;
        statusCode = 500;
    }

    // Ensure statusCode is a valid integer between 100 and 999
    let parsedStatus = parseInt(statusCode, 10);
    if (isNaN(parsedStatus) || parsedStatus < 100 || parsedStatus > 999) {
        parsedStatus = 500;
    }

    const response = { success: false, message };
    if (errors) response.errors = errors;
    return res.status(parsedStatus).json(response);
};

module.exports = { sendSuccess, sendError };