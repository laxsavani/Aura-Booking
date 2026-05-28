const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            unique: true,
        },
        type: {
            type: String,
            enum: ["Massage Therapies", "Facials & Skincare", "Body Treatments", "Nail Care", "Salon & Waxing", "Spa Packages", "Specialty/Med-Spa Treatments"],
            default: "",
        },
        description: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual populate for services associated with this category
categorySchema.virtual("services", {
    ref: "Service",
    localField: "_id",
    foreignField: "category"
});

module.exports = mongoose.model("Category", categorySchema);