const Banner = require("../models/banner");
const { sendSuccess, sendError } = require("../utils/response");
const { cloudinary } = require("../middlewares/upload.middleware");

// Get banners (public gets active, admin can request all via /admin endpoint)
const getBanners = async (req, res) => {
    try {
        const filter = {};
        // Explicitly check if it's the admin list route
        const isAdminRoute = req.originalUrl && req.originalUrl.includes("/admin");
        
        if (!isAdminRoute) {
            filter.isActive = true;
        }

        const banners = await Banner.find(filter).sort({ createdAt: -1 });
        return sendSuccess(res, 200, "Banners fetched successfully", banners);
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

// Add new banner (Admin Only, limit to max 5)
const addBanner = async (req, res) => {
    try {
        if (!req.file) {
            return sendError(res, 400, "Banner image file is required");
        }

        // Limit to max 5 banners
        const count = await Banner.countDocuments();
        if (count >= 5) {
            // Delete the uploaded file from Cloudinary to avoid orphan assets
            if (req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return sendError(res, 400, "Maximum banner limit of 5 reached. Please delete an existing banner before adding a new one.");
        }

        const { title, description, link, isActive } = req.body;

        const banner = await Banner.create({
            image: req.file.path,
            imagePublicId: req.file.filename,
            title: title ? title.trim() : "",
            description: description ? description.trim() : "",
            link: link ? link.trim() : "",
            isActive: isActive === "false" ? false : true,
        });

        return sendSuccess(res, 201, "Banner added successfully", banner);
    } catch (err) {
        // Cleanup file if DB creation fails
        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        return sendError(res, 500, err.message);
    }
};

// Update banner details or image (Admin Only)
const updateBanner = async (req, res) => {
    try {
        const { title, description, link, isActive } = req.body;
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            if (req.file && req.file.filename) {
                await cloudinary.uploader.destroy(req.file.filename);
            }
            return sendError(res, 404, "Banner not found");
        }

        if (req.file) {
            // Delete old image from Cloudinary
            if (banner.imagePublicId) {
                await cloudinary.uploader.destroy(banner.imagePublicId);
            }
            banner.image = req.file.path;
            banner.imagePublicId = req.file.filename;
        }

        if (title !== undefined) banner.title = title.trim();
        if (description !== undefined) banner.description = description.trim();
        if (link !== undefined) banner.link = link.trim();
        if (isActive !== undefined) {
            banner.isActive = isActive === "true" || isActive === true;
        }

        await banner.save();
        return sendSuccess(res, 200, "Banner updated successfully", banner);
    } catch (err) {
        if (req.file && req.file.filename) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        return sendError(res, 500, err.message);
    }
};

// Delete banner (Admin Only)
const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return sendError(res, 404, "Banner not found");
        }

        // Delete image from Cloudinary
        if (banner.imagePublicId) {
            await cloudinary.uploader.destroy(banner.imagePublicId);
        }

        await banner.deleteOne();
        return sendSuccess(res, 200, "Banner deleted successfully");
    } catch (err) {
        return sendError(res, 500, err.message);
    }
};

module.exports = {
    getBanners,
    addBanner,
    updateBanner,
    deleteBanner,
};
