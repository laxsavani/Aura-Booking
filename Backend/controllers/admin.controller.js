const User = require("../models/user");
const Appointment = require("../models/appointment");
const Service = require("../models/service");
const Category = require("../models/category");
const Notification = require("../models/notification");
const { sendSuccess, sendError } = require("../utils/response");
const { cloudinary } = require("../middlewares/upload.middleware");

const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAppointments,
      pendingAppointments,
      approvedAppointments,
      rejectedAppointments,
      totalServices,
      totalCategories,
    ] = await Promise.all([
      User.countDocuments({ role: "user", isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "Pending" }),
      Appointment.countDocuments({ status: "Approved" }),
      Appointment.countDocuments({ status: "Rejected" }),
      Service.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
    ]);

    return sendSuccess(res, 200, "Dashboard stats", {
      totalUsers,
      totalAppointments,
      pendingAppointments,
      approvedAppointments,
      rejectedAppointments,
      totalServices,
      totalCategories,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined)
      filter.isActive = req.query.isActive === "true";

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Users fetched", {
      count: users.length,
      users,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return sendError(res, 404, "User not found");

    const appointments = await Appointment.find({ user: req.params.id })
      .populate("service", "name photo")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "User detail", { user, appointments });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const assignRole = async (req, res) => {
  const { role } = req.body;

  if (!role || !["user", "admin"].includes(role)) {
    return sendError(res, 400, "Role must be 'user' or 'admin'");
  }

  // Prevent admin from changing their own role
  if (req.params.id === req.user._id.toString()) {
    return sendError(res, 400, "You cannot change your own role");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, select: "-password" },
  );

  if (!user) return sendError(res, 404, "User not found");

  return sendSuccess(res, 200, `Role updated to '${role}' successfully`, {
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

const toggleUserStatus = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, "You cannot deactivate your own account");
    }

    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, "User not found");

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    return sendSuccess(
      res,
      200,
      `User account ${user.isActive ? "activated" : "deactivated"}`,
      {
        userId: user._id,
        name: user.name,
        isActive: user.isActive,
      },
    );
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, "You cannot delete your own account");
    }

    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, "User not found");

    // Delete profile image from Cloudinary
    if (user.profileImagePublicId) {
      await cloudinary.uploader.destroy(user.profileImagePublicId);
    }
    if (user.faceScreenshotPublicId) {
      await cloudinary.uploader.destroy(user.faceScreenshotPublicId);
    }

    // Delete user's data
    await Appointment.deleteMany({ user: req.params.id });
    await Notification.deleteMany({ user: req.params.id });
    await user.deleteOne();

    return sendSuccess(res, 200, "User and all related data deleted");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  getUserDetail,
  assignRole,
  toggleUserStatus,
  deleteUser
};
