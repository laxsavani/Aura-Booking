const express = require("express");
const router = express.Router();
const c = require("../controllers/admin.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative dashboard, user listings, and permission controls (Requires Admin Role)
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieve summary stats including counts of active users, total and categorized appointments (Pending, Approved, Rejected), services, and categories.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats successfully fetched
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
 *                   example: Dashboard stats
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 45
 *                     totalAppointments:
 *                       type: integer
 *                       example: 120
 *                     pendingAppointments:
 *                       type: integer
 *                       example: 15
 *                     approvedAppointments:
 *                       type: integer
 *                       example: 85
 *                     rejectedAppointments:
 *                       type: integer
 *                       example: 20
 *                     totalServices:
 *                       type: integer
 *                       example: 18
 *                     totalCategories:
 *                       type: integer
 *                       example: 6
 *       401:
 *         description: Unauthorized session
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Internal server error
 */
router.get("/dashboard", protect, adminOnly, c.getDashboard);
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all system users
 *     description: Retrieve all registered users. Optional filters for `role` and `isActive` can be specified. Returns users sorted by registration date (newest first).
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user]
 *         description: Filter users by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter users by active status
 *     responses:
 *       200:
 *         description: Users list fetched successfully
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
 *                   example: Users fetched
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 2
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized session
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Internal server error
 */
router.get("/users", protect, adminOnly, c.getAllUsers);
/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details and appointments
 *     description: Fetch detailed profile information of a specific user along with their complete appointment booking history.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique User ID
 *         example: 60d21b4667d0d8992e610c82
 *     responses:
 *       200:
 *         description: User profile and bookings fetched successfully
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
 *                   example: User detail
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     appointments:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Invalid User ID format
 *       401:
 *         description: Unauthorized session
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/users/:id", protect, adminOnly, c.getUserDetail);
/**
 * @swagger
 * /api/admin/users/role/{id}:
 *   put:
 *     summary: Change user role (Assign permissions)
 *     description: Update the role of a user to either "user" or "admin". Admins are prevented from changing their own role.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique User ID to modify
 *         example: 60d21b4667d0d8992e610c82
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 description: New role classification
 *                 example: admin
 *     responses:
 *       200:
 *         description: Role updated successfully
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
 *                   example: Role updated to 'admin' successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error (e.g. invalid role specified, attempting to update own role)
 *       401:
 *         description: Unauthorized session
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put("/users/role/:id", protect, adminOnly, c.assignRole);
/**
 * @swagger
 * /api/admin/users/toggle-status/{id}:
 *   put:
 *     summary: Toggle user account status
 *     description: Activate or deactivate a user account.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User status toggled
 */
router.put("/users/toggle-status/:id", protect, adminOnly, c.toggleUserStatus);
/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Remove a user account from the system.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete("/users/:id", protect, adminOnly, c.deleteUser);

module.exports = router;