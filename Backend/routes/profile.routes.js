const express = require("express");
const router = express.Router();
const c = require("../controllers/profile.controller");
const { protect } = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/upload.middleware");

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Authenticated user profile and password management
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     description: Retrieve the currently logged in user's profile information (excludes password).
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile fetched
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c82
 *                         name:
 *                           type: string
 *                           example: Jane Doe
 *                         email:
 *                           type: string
 *                           example: jane@example.com
 *                         mobileNumber:
 *                           type: string
 *                           example: 9876543210
 *                         age:
 *                           type: integer
 *                           example: 25
 *                         gender:
 *                           type: string
 *                           example: female
 *                         country:
 *                           type: string
 *                           example: India
 *                         state:
 *                           type: string
 *                           example: Gujarat
 *                         profileImage:
 *                           type: string
 *                           example: https://res.cloudinary.com/demo/image/upload/v123456/profile.jpg
 *                         role:
 *                           type: string
 *                           example: user
 *       401:
 *         description: Unauthorized session
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/", protect, c.getProfile);
/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information. Supports uploading a new profile picture.
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user
 *                 example: Jane Doe Updated
 *               age:
 *                 type: integer
 *                 description: Age of the user
 *                 example: 26
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: Gender identity of the user
 *                 example: female
 *               country:
 *                 type: string
 *                 description: Country of residence
 *                 example: India
 *               state:
 *                 type: string
 *                 description: State or region
 *                 example: Gujarat
 *               mobileNumber:
 *                 type: string
 *                 description: Mobile number of the user
 *                 example: 9876543210
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload as profile avatar
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *       401:
 *         description: Unauthorized session
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put("/", protect, upload.single("profileImage"), c.updateProfile);
/**
 * @swagger
 * /api/profile/change-password:
 *   put:
 *     summary: Change user password
 *     description: Update password for the authenticated user session. Validates old password and requires new password confirmation.
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - conformPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password of the user
 *                 example: securePassword123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minimum: 6
 *                 description: New password for login
 *                 example: newlySecurePass456
 *               conformPassword:
 *                 type: string
 *                 format: password
 *                 description: Re-entered new password for verification
 *                 example: newlySecurePass456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         description: Validation error (e.g. password mismatch, invalid length, incorrect old password)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: New password and confirm password do not match
 *       401:
 *         description: Unauthorized session
 *       500:
 *         description: Internal server error
 */
router.put("/change-password", protect, c.changePassword);

module.exports = router;