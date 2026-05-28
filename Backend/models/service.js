const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        photo: {
            type: String,
            required: [true, "Service photo is required"],
        },
        photoPublicId: {
            type: String,
            default: "",
        },
        name: {
            type: String,
            required: [true, "Service name is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        // Auto-computed: price - (price * discount / 100)
        finalPrice: {
            type: Number,
            default: 0,
        },
        title: {
            type: String,
            trim: true,
            default: "",
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"],
        },
        serviceType: {
            type: String,
            enum: ["Normal", "High", "VIP", "VVIP"],
            default: "Normal",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Auto-compute finalPrice before save
serviceSchema.pre("save", function () {
    if (this.discount > 0) {
        this.finalPrice = parseFloat(
            (this.price - (this.price * this.discount) / 100).toFixed(2)
        );
    } else {
        this.finalPrice = this.price;
    }
});

module.exports = mongoose.model("Service", serviceSchema);