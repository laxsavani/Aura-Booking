const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: [true, "Banner image URL is required"],
        },
        imagePublicId: {
            type: String,
            required: [true, "Banner image public ID is required"],
        },
        title: {
            type: String,
            trim: true,
            default: "",
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        link: {
            type: String,
            trim: true,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
