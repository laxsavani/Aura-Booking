const express = require("express");
const router = express.Router();
const c = require("../controllers/auth.controller");
const { upload } = require("../middlewares/upload.middleware");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration and authentication management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user account with details and an optional facial verification image upload. Role is default "user" and cannot be modified from the request payload.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Unique email address of the user
 *                 example: jane@example.com
 *               mobileNumber:
 *                 type: string
 *                 description: Unique mobile contact number
 *                 example: 9876543210
 *               password:
 *                 type: string
 *                 format: password
 *                 minimum: 6
 *                 description: Password for account login (min 6 characters)
 *                 example: securePassword123
 *               age:
 *                 type: integer
 *                 description: Age of the user
 *                 example: 25
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
 *                 description: State or region of residence
 *                 example: Gujarat
 *               latitude:
 *                 type: number
 *                 description: Current latitude coordinate
 *                 example: 23.0225
 *               longitude:
 *                 type: number
 *                 description: Current longitude coordinate
 *                 example: 72.5714
 *               faceScreenshot:
 *                 type: string
 *                 format: binary
 *                 description: Portrait image file upload for facial registration
 *     responses:
 *       201:
 *         description: Registered successfully
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
 *                   example: Registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT session token
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c84
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
 *                           example: ""
 *                         faceScreenshot:
 *                           type: string
 *                           example: https://res.cloudinary.com/demo/image/upload/v123456/face.jpg
 *                         role:
 *                           type: string
 *                           example: user
 *                         location:
 *                           type: object
 *                           properties:
 *                             latitude:
 *                               type: number
 *                               example: 23.0225
 *                             longitude:
 *                               type: number
 *                               example: 72.5714
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:50:30.000Z
 *       400:
 *         description: Validation error or duplicate credentials
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
 *                   example: User with this email or mobile number already exists
 *       500:
 *         description: Internal server error
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
 *                   example: Server database timed out
 */
router.post(
    "/register",
    upload.fields([{ name: "faceScreenshot", maxCount: 1 }]),
    c.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate / Login user
 *     description: Login using email/mobileNumber/identifier combined with a password. Updates user geolocation in the system if coordinates are supplied.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email address
 *                 example: jane@example.com
 *               mobileNumber:
 *                 type: string
 *                 description: User mobile number
 *                 example: 9876543210
 *               identifier:
 *                 type: string
 *                 description: Alternative field accepting either email or mobile number
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *                 example: securePassword123
 *               latitude:
 *                 type: number
 *                 description: Current latitude location coordinate
 *                 example: 23.0225
 *               longitude:
 *                 type: number
 *                 description: Current longitude location coordinate
 *                 example: 72.5714
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c84
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
 *                           example: ""
 *                         faceScreenshot:
 *                           type: string
 *                           example: https://res.cloudinary.com/demo/image/upload/v123456/face.jpg
 *                         role:
 *                           type: string
 *                           example: user
 *                         location:
 *                           type: object
 *                           properties:
 *                             latitude:
 *                               type: number
 *                               example: 23.0225
 *                             longitude:
 *                               type: number
 *                               example: 72.5714
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:50:30.000Z
 *       400:
 *         description: Missing credentials
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
 *                   example: Email or mobile number is required
 *       401:
 *         description: Invalid credentials
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
 *                   example: Invalid credentials
 *       403:
 *         description: Account deactivated
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
 *                   example: Your account has been deactivated. Contact support.
 *       500:
 *         description: Internal server error
 */
router.post("/login", c.login);

// NODEJS LOGOUT API

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out user
 *     description: Clear user session. The client (e.g. web browser or Flutter app) is responsible for deleting the JWT token from local storage or secure storage.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                   example: Logout successful
 *       500:
 *         description: Internal server error
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
 *                   example: Server Error
 */
router.post("/logout", c.logout);

module.exports = router;
