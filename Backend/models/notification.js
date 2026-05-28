const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Which user receives this notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "appointment_pending",
        "appointment_approved",
        "appointment_rejected",
        "appointment_cancelled",
        "general",
      ],
      default: "general",
    },
    // Related appointment (if any)
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Extra data for notification history display
    userName: { type: String, default: "" },
    mobileNumber: { type: String, default: "" },
    orderNumber: { type: String, default: "" },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);