const Category = require("../models/category");
const Service = require("../models/service");
const { sendSuccess, sendError } = require("../utils/response");
const { cloudinary } = require("../middlewares/upload.middleware");

const addCategory = async (req, res) => {
    try {
        const { name, type, description } = req.body;
        if (!name || name.trim() === "") {
            return sendError(res, 400, "Category name is required");
        }

        const existing = await Category.findOne({ name: name.trim() });
        if (existing) {
            return sendError(res, 400, "Category with this name already exists");
        }

        const category = await Category.create({
            name: name.trim(),
            type: type || "",
            description: description || ""
        })

        return sendSuccess(res, 201, "Category added successfully", category);
    } catch (err) {
        return sendError(res, 500, err.message);
    }
}

const updateCategory = async (req, res) => {
    try {
        const { name, type, description, isActive } = req.body;

        const category = await Category.findById(req.params.id);
        if (!category) return sendError(res, 404, "Category not found");

        if (name) category.name = name.trim();
        if (type) category.type = type;
        if (description) category.description = description;
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();
        return sendSuccess(res, 200, "Category updated", { category });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return sendError(res, 404, "Category not found");
        await category.deleteOne();
        return sendSuccess(res, 200, "Category deleted successfully", category);
    } catch (err) {
        return sendError(res, 500, err.message);
    }
}

const getCategories = async (req, res) => {
    try {
        const { type, page = 1, limit = 100 } = req.query;
        const query = {};
        if (type) query.type = type;

        const parsedLimit = parseInt(limit);

        const categories = await Category.find(query)
            .populate("services", "_id name")
            .skip((page - 1) * parsedLimit)
            .limit(parsedLimit)
            .sort({ name: 1 });

        return sendSuccess(res, 200, "Categories fetched successfully", categories);
    } catch (err) {
        return sendError(res, 500, err.message);
    }
}

const addService = async (req, res) => {
    try {
        const { name, description, price, discount, title, categoryId, serviceType } = req.body;

        if (!req.file) return sendError(res, 400, "Service photo is required");
        if (!name) return sendError(res, 400, "Service name is required");
        if (!description) return sendError(res, 400, "Description is required");
        if (!price) return sendError(res, 400, "Price is required");
        if (!categoryId) return sendError(res, 400, "Category is required");

        const category = await Category.findById(categoryId);
        if (!category) return sendError(res, 404, "Category not found");

        const service = await Service.create({
            photo: req.file.path,
            photoPublicId: req.file.filename,
            name: name.trim(),
            description,
            price: parseFloat(price),
            discount: discount ? parseFloat(discount) : 0,
            title: title || "",
            category: categoryId,
            serviceType: serviceType || "Normal",
        });

        await service.populate("category", "name type");

        return sendSuccess(res, 201, "Service added successfully", { service });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
}

const updateService = async (req, res) => {
    try {
        const { name, description, price, discount, title, categoryId, serviceType, isActive } =
            req.body;

        const service = await Service.findById(req.params.id);
        if (!service) return sendError(res, 404, "Service not found");

        // Replace photo if new one uploaded
        if (req.file) {
            if (service.photoPublicId) {
                await cloudinary.uploader.destroy(service.photoPublicId);
            }
            service.photo = req.file.path;
            service.photoPublicId = req.file.filename;
        }

        if (name) service.name = name.trim();
        if (description) service.description = description;
        if (price !== undefined) service.price = parseFloat(price);
        if (discount !== undefined) service.discount = parseFloat(discount);
        if (title !== undefined) service.title = title;
        if (categoryId) service.category = categoryId;
        if (serviceType) service.serviceType = serviceType;
        if (isActive !== undefined) service.isActive = isActive;

        await service.save();
        await service.populate("category", "name type");

        return sendSuccess(res, 200, "Service updated", { service });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
}

const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return sendError(res, 404, "Service not found");

        if (service.photoPublicId) {
            await cloudinary.uploader.destroy(service.photoPublicId);
        }

        await service.deleteOne();
        return sendSuccess(res, 200, "Service deleted");
    } catch (err) {
        return sendError(res, 500, err.message);
    }
}

const getServices = async (req, res) => {
    try {
        const filter = { isActive: true };
        if (req.query.categoryId) filter.category = req.query.categoryId;
        if (req.query.serviceType) {
            filter.serviceType = { $regex: new RegExp(`^${req.query.serviceType.trim()}$`, "i") };
        }

        const services = await Service.find(filter)
            .populate("category", "name type")
            .sort({ createdAt: -1 });

        return sendSuccess(res, 200, "Services fetched", {
            count: services.length,
            services,
        });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
}

const getServiceDetail = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate(
            "category",
            "name type"
        );
        if (!service || !service.isActive)
            return sendError(res, 404, "Service not found");

        return sendSuccess(res, 200, "Service detail", { service });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
}

const getSlider = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true })
            .populate("category", "name type")
            .select("photo name title finalPrice price discount serviceType category")
            .sort({ createdAt: -1 })
            .limit(10);

        return sendSuccess(res, 200, "Slider data fetched", { services });
    } catch (err) {
        return sendError(res, 500, err.message);
    }
}

module.exports = {
    addCategory,
    updateCategory,
    deleteCategory,
    getCategories,
    addService,
    updateService,
    deleteService,
    getServices,
    getServiceDetail,
    getSlider
}