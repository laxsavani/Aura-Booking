const Appointment = require("../models/appointment");
const Notification = require("../models/notification");
const Service = require("../models/service");
const { sendSuccess, sendError } = require("../utils/response");

const getMultiplier = (tier) => {
  switch (tier) {
    case "High": return 1.2;
    case "VIP": return 1.5;
    case "VVIP": return 2.0;
    default: return 1.0;
  }
};

const bookAppointment = async (req, res) => {
  try {
    const {
      fullName,
      address,
      state,
      country,
      mobileNumber,
      categoryId,
      serviceId,
      serviceType,
      appointmentDate,
      notes,
    } = req.body;

    if (!fullName) return sendError(res, 400, "Full name is required");
    if (!address) return sendError(res, 400, "Address is required");
    if (!state) return sendError(res, 400, "State is required");
    if (!country) return sendError(res, 400, "Country is required");
    if (!mobileNumber) return sendError(res, 400, "Mobile number is required");
    if (!categoryId) return sendError(res, 400, "Category is required");
    if (!serviceId) return sendError(res, 400, "Service is required");
    if (!serviceType) return sendError(res, 400, "Service type is required");
    if (!appointmentDate)
      return sendError(res, 400, "Appointment date is required");

    const parsedDate = new Date(appointmentDate);
    if (isNaN(parsedDate.getTime())) {
      return sendError(res, 400, "Invalid appointment date format");
    }

    const service = await Service.findById(serviceId);
    if (!service) return sendError(res, 404, "Service not found");

    const multiplier = getMultiplier(serviceType);
    const calculatedPrice = Math.round(service.finalPrice * multiplier);

    const appointment = await Appointment.create({
      user: req.user._id,
      fullName: fullName.trim(),
      address,
      state,
      country,
      mobileNumber,
      category: categoryId,
      service: serviceId,
      serviceType,
      appointmentDate: parsedDate,
      notes: notes || "",
      price: calculatedPrice,
      status: "Pending",
    });

    await Notification.create({
      user: req.user._id,
      title: "Appointment Booked",
      body: `Your appointment #${appointment.orderNumber} has been placed and is pending approval.`,
      type: "appointment_pending",
      appointment: appointment._id,
      userName: fullName,
      mobileNumber,
      orderNumber: appointment.orderNumber,
      price: calculatedPrice,
    });

    await appointment.populate([
      { path: "category", select: "name type" },
      { path: "service", select: "name photo finalPrice serviceType" },
    ]);

    return sendSuccess(
      res,
      201,
      "Appointment booked successfully. Pending admin approval.",
      { appointment },
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return sendError(res, 400, "Validation Error", messages);
    }
    if (error.name === "CastError") {
      return sendError(res, 400, `Invalid ${error.path}: ${error.value}`);
    }
    return sendError(res, 500, error.message);
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const appointments = await Appointment.find(filter)
      .populate("category", "name type")
      .populate("service", "name photo finalPrice serviceType")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Appointments fetched", {
      count: appointments.length,
      appointments,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const getAppointmentDetail = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("category", "name type")
      .populate("service", "name photo finalPrice serviceType description")
      .populate("user", "name email mobileNumber profileImage");

    if (!appointment) return sendError(res, 404, "Appointment not found");

    return sendSuccess(res, 200, "Appointment detail", { appointment });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!appointment) return sendError(res, 404, "Appointment not found");

    if (appointment.status !== "Pending") {
      return sendError(
        res,
        400,
        `Cannot edit appointment with status '${appointment.status}'. Only Pending appointments can be edited.`,
      );
    }

    const editableFields = [
      "fullName",
      "address",
      "state",
      "country",
      "mobileNumber",
      "serviceType",
      "appointmentDate",
      "notes",
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        appointment[field] = req.body[field];
      }
    });

    if (req.body.serviceType !== undefined) {
      const service = await Service.findById(appointment.service);
      if (service) {
        const multiplier = getMultiplier(appointment.serviceType);
        appointment.price = Math.round(service.finalPrice * multiplier);
      }
    }

    await appointment.save();

    return sendSuccess(res, 200, "Appointment updated", { appointment });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!appointment) return sendError(res, 404, "Appointment not found");

    if (appointment.status === "Approved") {
      return sendError(
        res,
        400,
        "Cannot cancel an already approved appointment",
      );
    }
    if (appointment.status === "Cancelled") {
      return sendError(res, 400, "Appointment is already cancelled");
    }

    appointment.status = "Cancelled";
    await appointment.save();

    // Notify user
    await Notification.create({
      user: req.user._id,
      title: "Appointment Cancelled",
      body: `Your appointment #${appointment.orderNumber} has been cancelled.`,
      type: "appointment_cancelled",
      appointment: appointment._id,
      orderNumber: appointment.orderNumber,
      price: appointment.price,
    });

    return sendSuccess(res, 200, "Appointment cancelled", { appointment });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!appointment) return sendError(res, 404, "Appointment not found");

    return sendSuccess(res, 200, "Appointment deleted successfully");
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const deleteAllMyAppointments = async (req, res) => {
  try {
    const result = await Appointment.deleteMany({ user: req.user._id });
    return sendSuccess(res, 200, `${result.deletedCount} appointments deleted`);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const adminGetAllAppointments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
 
    const appointments = await Appointment.find(filter)
      .populate("user", "name email mobileNumber profileImage")
      .populate("category", "name type")
      .populate("service", "name photo finalPrice serviceType")
      .sort({ createdAt: -1 });
 
    return sendSuccess(res, 200, "All appointments fetched", {
      count: appointments.length,
      appointments,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const adminGetAppointmentDetail = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("user", "name email mobileNumber profileImage location")
      .populate("category", "name type")
      .populate("service", "name photo finalPrice serviceType description");
 
    if (!appointment) return sendError(res, 404, "Appointment not found");
 
    return sendSuccess(res, 200, "Appointment detail", { appointment });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const adminUpdateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Approved", "Rejected", "Pending"];
 
    if (!status || !validStatuses.includes(status)) {
      return sendError(res, 400, "Status must be Approved, Rejected, or Pending");
    }
 
    const appointment = await Appointment.findById(req.params.id).populate(
      "user",
      "name mobileNumber"
    );
    if (!appointment) return sendError(res, 404, "Appointment not found");
 
    const prevStatus = appointment.status;
    appointment.status = status;
    await appointment.save();
 
    // Create notification for user about status change
    const notifType =
      status === "Approved" ? "appointment_approved" : "appointment_rejected";
 
    await Notification.create({
      user: appointment.user._id,
      title: `Appointment ${status}`,
      body: `Your appointment #${appointment.orderNumber} has been ${status.toLowerCase()} by the admin.`,
      type: notifType,
      appointment: appointment._id,
      userName: appointment.user.name,
      mobileNumber: appointment.user.mobileNumber,
      orderNumber: appointment.orderNumber,
      price: appointment.price,
    });
 
    return sendSuccess(res, 200, `Appointment status updated to '${status}'`, {
      appointment,
    });
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAppointmentDetail,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  deleteAllMyAppointments,
  adminGetAllAppointments,
  adminGetAppointmentDetail,
  adminUpdateStatus
};
