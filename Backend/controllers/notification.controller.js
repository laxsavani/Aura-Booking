const mongoose = require("mongoose");
const Notification = require("../models/notification");
const { sendSuccess, sendError } = require("../utils/response");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate(
        "appointment",
        "orderNumber status appointmentDate serviceType price",
      )
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    return sendSuccess(res, 200, "Notifications fetched", {
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const markAsRead = async (req, res) => {
  try {
    // If client passes "all", gracefully delegate to markAllAsRead
    if (req.params.id === "all") {
      return markAllAsRead(req, res);
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, "Invalid notification ID format");
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true },
    );

    if (!notification) return sendError(res, 404, "Notification not found");

    return sendSuccess(res, 200, "Notification marked as read", {
      notification,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true },
    );

    return sendSuccess(
      res,
      200,
      `${result.modifiedCount} notifications marked as read`,
    );
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const deleteNotification = async (req, res) => {
  try {
    // If client passes "all", gracefully delegate to deleteAllNotifications
    if (req.params.id === "all") {
      return deleteAllNotifications(req, res);
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 400, "Invalid notification ID format");
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) return sendError(res, 404, "Notification not found");

    return sendSuccess(res, 200, "Notification deleted");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ user: req.user._id });
    return sendSuccess(
      res,
      200,
      `${result.deletedCount} notifications deleted`,
    );
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
};
