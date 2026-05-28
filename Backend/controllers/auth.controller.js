const User = require("../models/user");
const { generateToken } = require("../utils/token");
const { sendSuccess, sendError } = require("../utils/response");

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email || null,
  mobileNumber: user.mobileNumber || null,
  age: user.age,
  gender: user.gender,
  country: user.country,
  state: user.state,
  profileImage: user.profileImage,
  faceScreenshot: user.faceScreenshot,
  role: user.role,           // ← always from DB, never from request
  location: user.location,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      mobileNumber,
      password,
      age,
      gender,
      country,
      state,
      latitude,
      longitude,
    } = req.body;

    // Validations
    if (!name || name.trim() === "") {
      return sendError(res, 400, "Name is required");
    }
    if (!password || password.length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters");
    }
    if (!email && !mobileNumber) {
      return sendError(res, 400, "Email or mobile number is required");
    }

    // Check existing user
    const orQuery = [];
    if (email) orQuery.push({ email: email.toLowerCase() });
    if (mobileNumber) orQuery.push({ mobileNumber });

    const existing = await User.findOne({ $or: orQuery });
    if (existing) {
      return sendError(res, 400, "User with this email or mobile number already exists");
    }

    // Build user data — role is NOT accepted from request body
    const userData = {
      name: name.trim(),
      password,
      age: age || null,
      gender: gender || null,
      country: country ? country.trim() : null,
      state: state ? state.trim() : null,
      location: {
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    };

    if (email) userData.email = email.toLowerCase().trim();
    if (mobileNumber) userData.mobileNumber = mobileNumber.trim();

    // Face screenshot uploaded via Cloudinary
    if (req.files?.faceScreenshot?.[0]) {
      userData.faceScreenshot = req.files.faceScreenshot[0].path;
      userData.faceScreenshotPublicId = req.files.faceScreenshot[0].filename;
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    return sendSuccess(res, 201, "Registered successfully", {
      token,
      user: formatUser(user),
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, mobileNumber, password, latitude, longitude } = req.body;

    if (!email && !mobileNumber && !req.body.identifier) {
      return sendError(res, 400, "Email or mobile number is required");
    }
    if (!password) {
      return sendError(res, 400, "Password is required");
    }

    // Build query to check both fields against all provided inputs
    const orConditions = [];
    if (email) {
      orConditions.push({ email: email.toLowerCase().trim() });
      orConditions.push({ mobileNumber: email.trim() });
    }
    if (mobileNumber) {
      orConditions.push({ mobileNumber: mobileNumber.trim() });
      orConditions.push({ email: mobileNumber.toLowerCase().trim() });
    }
    if (req.body.identifier) {
      orConditions.push({ email: req.body.identifier.toLowerCase().trim() });
      orConditions.push({ mobileNumber: req.body.identifier.trim() });
    }

    const query = { $or: orConditions };
    // Fetch user with password and role from DB
    const user = await User.findOne(query).select("+password +role");
    if (!user) {
      return sendError(res, 401, "Invalid credentials");
    }
    if (!user.isActive) {
      return sendError(res, 403, "Your account has been deactivated. Contact support.");
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, "Invalid credentials");
    }

    // Update location on every login
    if (latitude && longitude) {
      user.location = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };
      await user.save({ validateBeforeSave: false });
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 200, "Login successful", {
      token,
      user: formatUser(user), // role from DB
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = {
  register,
  login,
};