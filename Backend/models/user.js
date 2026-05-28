const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        required: [true, "Email is required"],
    },
    mobileNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    age: {
        type: Number,
        default: null,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: null,
    },
    country: {
        type: String,
        trim: true,
        default: null,
    },
    state: {
        type: String,
        trim: true,
        default: null,
    },
    profileImage: {
        type: String,
        default: "",
    },
    profileImagePublicId: {
        type: String,
        default: "",
    },
    faceScreenshot: {
        type: String,
        default: "",
    },
    faceScreenshotPublicId: {
        type: String,
        default: "",
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    location: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Alias to matchPassword for robustness and backward compatibility
userSchema.methods.comparePassword = userSchema.methods.matchPassword;

module.exports = mongoose.model("User", userSchema);