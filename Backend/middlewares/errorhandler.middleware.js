const { sendError } = require("../utils/response");

const errorHandler = (err, req, res, next) => {
    console.error("❌ Error:", err.message);

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        return sendError(res, 400, `${field} '${value}' already exists`);
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return sendError(res, 400, "Validation Error", messages);
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === "CastError") {
        return sendError(res, 400, `Invalid ${err.path}: ${err.value}`);
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return sendError(res, 401, "Invalid token");
    }
    if (err.name === "TokenExpiredError") {
        return sendError(res, 401, "Token expired");
    }

    // Multer file size error
    if (err.code === "LIMIT_FILE_SIZE") {
        return sendError(res, 400, "File size too large. Max 5MB allowed.");
    }

    // Default server error
    return sendError(res, err.statusCode || 500, err.message || "Internal Server Error");
};

module.exports = errorHandler;