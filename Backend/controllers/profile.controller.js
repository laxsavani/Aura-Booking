const User = require("../models/user");
const { sendSuccess, sendError } = require("../utils/response");
const { cloudinary } = require("../middlewares/upload.middleware");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return sendError(res, 404, "User not found");

    return sendSuccess(res, 200, "Profile fetched", { user });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, age, gender, country, state, mobileNumber } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 404, "User not found");

    if (name) user.name = name.trim();
    if (age !== undefined) user.age = age;
    if (gender) user.gender = gender;
    if (country) user.country = country.trim();
    if (state) user.state = state.trim();
    if (mobileNumber) user.mobileNumber = mobileNumber.trim();

    if (req.file) {
      if (user.profileImagePublicId) {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
      }
      user.profileImage = req.file.path;
      user.profileImagePublicId = req.file.filename;
    }

    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, 200, "Profile updated successfully", {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        age: user.age,
        gender: user.gender,
        country: user.country,
        state: user.state,
        profileImage: user.profileImage,
        role: user.role,
        location: user.location,
      },
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, conformPassword } = req.body;

    if (!oldPassword) return sendError(res, 400, "Old password is required");
    if (!newPassword) return sendError(res, 400, "New password is required");
    if (!conformPassword)
      return sendError(res, 400, "Confirm password is required");

    if (newPassword !== conformPassword) {
      return sendError(
        res,
        400,
        "New password and confirm password do not match",
      );
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, "New password must be at least 6 characters");
    }
    if (oldPassword === newPassword) {
      return sendError(
        res,
        400,
        "New password must be different from old password",
      );
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return sendError(res, 400, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 200, "Password changed successfully");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
