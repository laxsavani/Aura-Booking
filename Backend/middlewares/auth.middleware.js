const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendError } = require("../utils/response");

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return sendError(res, 401, "Not authorized, please login.");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("+role");
        if (!user) {
            return sendError(res, 401, "User no longer exists");
        }
        if (!user.isActive) {
            return sendError(res, 403, "Your account has been deactivated");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return sendError(res, 401, "Token expired. Please login again.");
        }
        return sendError(res, 401, "Invalid token. Please login again.");
    }
};

exports.adminOnly = async (req, res, next) => {
    if (req.user.role !== "admin") {
        return sendError(res, 403, "Asscess denied. Admin only.");
    }
    next();
}