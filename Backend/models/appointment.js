const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        // Relationship: which user booked
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Appointment form fields
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        address: {
            type: String,
            required: [true, "Address is required"],
        },
        state: {
            type: String,
            required: [true, "State is required"],
        },
        country: {
            type: String,
            required: [true, "Country is required"],
        },
        mobileNumber: {
            type: String,
            required: [true, "Mobile number is required"],
        },
        // Relationship: which category
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        // Relationship: which service
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },
        // Service tier at time of booking
        serviceType: {
            type: String,
            enum: ["Normal", "High", "VIP", "VVIP"],
            required: true,
        },
        appointmentDate: {
            type: Date,
            required: [true, "Appointment date is required"],
        },
        // Status flow: Pending → Approved / Rejected
        // User can also Cancel
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Cancelled"],
            default: "Pending",
        },
        // Auto-generated unique order number
        orderNumber: {
            type: String,
            unique: true,
        },
        // Price snapshot at time of booking
        price: {
            type: Number,
            default: 0,
        },
        notes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Auto-generate order number before save
appointmentSchema.pre("save", function () {
    if (!this.orderNumber) {
        this.orderNumber = "SPA-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    }
});

module.exports = mongoose.model("Appointment", appointmentSchema);