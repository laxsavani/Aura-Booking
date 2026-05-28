const express = require("express");
const router = express.Router();
const c = require("../controllers/notification.controller");
const { protect } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification history and read status management
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Fetch user notifications
 *     description: Retrieve all notifications for the authenticated user, sorted by creation date (newest first), along with the total count of unread notifications.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
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
 *                   example: Notifications fetched
 *                 data:
 *                   type: object
 *                   properties:
 *                     unreadCount:
 *                       type: integer
 *                       example: 2
 *                     count:
 *                       type: integer
 *                       example: 5
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 60d21b4667d0d8992e610c84
 *                           user:
 *                             type: string
 *                             example: 60d21b4667d0d8992e610c82
 *                           title:
 *                             type: string
 *                             example: Appointment Booked
 *                           message:
 *                             type: string
 *                             example: Your appointment has been booked successfully.
 *                           isRead:
 *                             type: boolean
 *                             example: false
 *                           appointment:
 *                             type: string
 *                             example: 60d21b4667d0d8992e610c83
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-05-21T10:00:00.000Z
 *       401:
 *         description: Unauthorized session
 *       500:
 *         description: Internal server error
 */
router.get("/", protect, c.getNotifications);
/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     description: Mark all unread notifications belonging to the authenticated user as read.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked as read successfully
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
 *                   example: 3 notifications marked as read
 *       401:
 *         description: Unauthorized session
 *       500:
 *         description: Internal server error
 */
router.put("/read-all", protect, c.markAllAsRead);
/**
 * @swagger
 * /api/notifications/read/{id}:
 *   put:
 *     summary: Mark a specific notification as read
 *     description: Mark a single notification as read by its unique notification ID.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique notification ID
 *         example: 60d21b4667d0d8992e610c84
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
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
 *                   example: Notification marked as read
 *                 data:
 *                   type: object
 *                   properties:
 *                     notification:
 *                       type: object
 *       400:
 *         description: Invalid notification ID format
 *       401:
 *         description: Unauthorized session
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.put("/read/:id", protect, c.markAsRead);
/**
 * @swagger
 * /api/notifications/all:
 *   delete:
 *     summary: Delete all notifications
 *     description: Delete all notifications belonging to the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications deleted successfully
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
 *                   example: 5 notifications deleted
 *       401:
 *         description: Unauthorized session
 *       500:
 *         description: Internal server error
 */
router.delete("/all", protect, c.deleteAllNotifications);
/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a specific notification
 *     description: Delete a single notification by its unique notification ID.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique notification ID
 *         example: 60d21b4667d0d8992e610c84
 *     responses:
 *       200:
 *         description: Notification deleted successfully
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
 *                   example: Notification deleted
 *       400:
 *         description: Invalid notification ID format
 *       401:
 *         description: Unauthorized session
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", protect, c.deleteNotification);

module.exports = router;