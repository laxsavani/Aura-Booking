const express = require("express");
const router = express.Router();
const c = require("../controllers/banner.controller");
const { upload } = require("../middlewares/upload.middleware");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Banners
 *   description: Mobile App Promotional Banners management
 */

/**
 * @swagger
 * /api/banners:
 *   get:
 *     summary: Fetch active banners
 *     description: Retrieve all active banners for display in the client application home screen slider.
 *     tags: [Banners]
 *     responses:
 *       200:
 *         description: Active banners fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/", c.getBanners);

/**
 * @swagger
 * /api/banners/admin:
 *   get:
 *     summary: Get all banners for admin management
 *     description: Retrieve both active and disabled banners for administrative catalog overview.
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Banners list fetched successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only access
 *       500:
 *         description: Server error
 */
router.get("/admin", protect, adminOnly, c.getBanners);

/**
 * @swagger
 * /api/banners:
 *   post:
 *     summary: Create a new promotional banner (Admin Only)
 *     description: Upload a banner image (under 'banner' folder on Cloudinary) and register banner data in MongoDB. Strict limit of 5 banners.
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - banner
 *             properties:
 *               banner:
 *                 type: string
 *                 format: binary
 *                 description: Banner image asset (JPG, JPEG, PNG, WEBP)
 *               title:
 *                 type: string
 *                 description: Optional title for user-facing promotion
 *               description:
 *                 type: string
 *                 description: Optional description for user-facing promotion
 *               link:
 *                 type: string
 *                 description: Optional action link / CTA redirect URL
 *               isActive:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 default: "true"
 *                 description: Initial visible status
 *     responses:
 *       201:
 *         description: Banner created successfully
 *       400:
 *         description: Validation error or max banner limit (5) reached
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only access
 *       500:
 *         description: Server error
 */
router.post("/", protect, adminOnly, upload.single("banner"), c.addBanner);

/**
 * @swagger
 * /api/banners/{id}:
 *   put:
 *     summary: Update an existing banner (Admin Only)
 *     description: Replace banner details, toggle active flags, or replace its image asset in Cloudinary.
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner MongoDB ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               banner:
 *                 type: string
 *                 format: binary
 *                 description: Optional replacement banner image file
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               link:
 *                 type: string
 *               isActive:
 *                 type: string
 *                 enum: ["true", "false"]
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only access
 *       404:
 *         description: Banner not found
 *       500:
 *         description: Server error
 */
router.put("/:id", protect, adminOnly, upload.single("banner"), c.updateBanner);

/**
 * @swagger
 * /api/banners/{id}:
 *   delete:
 *     summary: Delete a banner (Admin Only)
 *     description: Remove banner document and clean up its corresponding image asset from Cloudinary storage.
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner MongoDB ID
 *     responses:
 *       200:
 *         description: Banner deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only access
 *       404:
 *         description: Banner not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", protect, adminOnly, c.deleteBanner);

module.exports = router;
