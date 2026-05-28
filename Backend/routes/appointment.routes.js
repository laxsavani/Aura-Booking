const express = require("express");
const router = express.Router();
const c = require("../controllers/appointment.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment booking and management for users and admin administrators
 */

// ─── User Routes ─────────────────────────────────────────────
/**
 * @swagger
 * /api/appointments/book:
 *   post:
 *     summary: Book a new appointment
 *     description: Book a new spa appointment. All fields (fullName, address, state, country, mobileNumber, categoryId, serviceId, serviceType, appointmentDate) are required.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - address
 *               - state
 *               - country
 *               - mobileNumber
 *               - categoryId
 *               - serviceId
 *               - serviceType
 *               - appointmentDate
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Jane Doe
 *               address:
 *                 type: string
 *                 example: 456 Luxury Suite Rd
 *               state:
 *                 type: string
 *                 example: Gujarat
 *               country:
 *                 type: string
 *                 example: India
 *               mobileNumber:
 *                 type: string
 *                 example: 9876543210
 *               categoryId:
 *                 type: string
 *                 example: 60d21b4667d0d8992e610c85
 *               serviceId:
 *                 type: string
 *                 example: 60d21b4667d0d8992e610c86
 *               serviceType:
 *                 type: string
 *                 enum: [Normal, High, VIP, VVIP]
 *                 example: VIP
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-06-15T10:00:00.000Z
 *               notes:
 *                 type: string
 *                 example: Prefer standard morning session.
 *     responses:
 *       201:
 *         description: Appointment booked successfully, pending admin approval
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
 *                   example: Appointment booked successfully. Pending admin approval.
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c87
 *                         user:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c84
 *                         fullName:
 *                           type: string
 *                           example: Jane Doe
 *                         address:
 *                           type: string
 *                           example: 456 Luxury Suite Rd
 *                         state:
 *                           type: string
 *                           example: Gujarat
 *                         country:
 *                           type: string
 *                           example: India
 *                         mobileNumber:
 *                           type: string
 *                           example: 9876543210
 *                         category:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 60d21b4667d0d8992e610c85
 *                             name:
 *                               type: string
 *                               example: Massage Therapies
 *                             type:
 *                               type: string
 *                               example: Massage
 *                         service:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 60d21b4667d0d8992e610c86
 *                             name:
 *                               type: string
 *                               example: Deep Tissue Massage
 *                             photo:
 *                               type: string
 *                               example: https://res.cloudinary.com/demo/image/upload/v123456/spa/service.jpg
 *                             finalPrice:
 *                               type: number
 *                               example: 120
 *                             serviceType:
 *                               type: string
 *                               example: Massage
 *                         serviceType:
 *                           type: string
 *                           example: VIP
 *                         appointmentDate:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-06-15T10:00:00.000Z
 *                         status:
 *                           type: string
 *                           example: Pending
 *                         orderNumber:
 *                           type: string
 *                           example: SPA-1716215328000-456
 *                         price:
 *                           type: number
 *                           example: 120
 *                         notes:
 *                           type: string
 *                           example: Prefer standard morning session.
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:42:48.000Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:42:48.000Z
 *       400:
 *         description: Validation error / Missing fields
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
 *                   example: Validation Error
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Full name is required"]
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Service not found
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
 *                   example: Service not found
 *       500:
 *         description: Server error
 */
router.post("/book", protect, c.bookAppointment);
/**
 * @swagger
 * /api/appointments/my:
 *   get:
 *     summary: Fetch current user's appointments list
 *     description: Retrieve all appointments booked by the currently authenticated user, sorted by the booking creation date (newest first). Supports filtering by status.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected, Cancelled]
 *         description: Optional status filter to only show appointments matching this state.
 *     responses:
 *       200:
 *         description: Appointments fetched successfully
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
 *                   example: Appointments fetched
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 1
 *                     appointments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 60d21b4667d0d8992e610c87
 *                           user:
 *                             type: string
 *                             example: 60d21b4667d0d8992e610c84
 *                           fullName:
 *                             type: string
 *                             example: Jane Doe
 *                           address:
 *                             type: string
 *                             example: 456 Luxury Suite Rd
 *                           state:
 *                             type: string
 *                             example: Gujarat
 *                           country:
 *                             type: string
 *                             example: India
 *                           mobileNumber:
 *                             type: string
 *                             example: 9876543210
 *                           category:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 60d21b4667d0d8992e610c85
 *                               name:
 *                                 type: string
 *                                 example: Massage Therapies
 *                               type:
 *                                 type: string
 *                                 example: Massage
 *                           service:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 60d21b4667d0d8992e610c86
 *                               name:
 *                                 type: string
 *                                 example: Deep Tissue Massage
 *                               photo:
 *                                 type: string
 *                                 example: https://res.cloudinary.com/demo/image/upload/v123456/spa/service.jpg
 *                               finalPrice:
 *                                 type: number
 *                                 example: 120
 *                               serviceType:
 *                                 type: string
 *                                 example: Massage
 *                           serviceType:
 *                             type: string
 *                             example: VIP
 *                           appointmentDate:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-06-15T10:00:00.000Z
 *                           status:
 *                             type: string
 *                             example: Pending
 *                           orderNumber:
 *                             type: string
 *                             example: SPA-1716215328000-456
 *                           price:
 *                             type: number
 *                             example: 120
 *                           notes:
 *                             type: string
 *                             example: Prefer standard morning session.
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-05-20T16:42:48.000Z
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-05-20T16:42:48.000Z
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get("/my", protect, c.getMyAppointments);
/**
 * @swagger
 * /api/appointments/my/all:
 *   delete:
 *     summary: Delete all appointments for the current user
 *     description: Permanently clear all appointment records booked by the currently authenticated user.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All appointments deleted successfully
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
 *                   example: 3 appointments deleted
 *                 data:
 *                   type: object
 *                   example: {}
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.delete("/my/all", protect, c.deleteAllMyAppointments);
/**
 * @swagger
 * /api/appointments/my/{id}:
 *   get:
 *     summary: Fetch single appointment detail
 *     description: Retrieve detailed information about a specific appointment belonging to the logged-in user. Fully populates the associated category, service, and user data.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the appointment.
 *     responses:
 *       200:
 *         description: Appointment detail fetched successfully
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
 *                   example: Appointment detail
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c87
 *                         user:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 60d21b4667d0d8992e610c84
 *                             name:
 *                               type: string
 *                               example: Jane Doe
 *                             email:
 *                               type: string
 *                               example: jane@example.com
 *                             mobileNumber:
 *                               type: string
 *                               example: 9876543210
 *                             profileImage:
 *                               type: string
 *                               example: https://res.cloudinary.com/demo/image/upload/v123456/profile.jpg
 *                         fullName:
 *                           type: string
 *                           example: Jane Doe
 *                         address:
 *                           type: string
 *                           example: 456 Luxury Suite Rd
 *                         state:
 *                           type: string
 *                           example: Gujarat
 *                         country:
 *                           type: string
 *                           example: India
 *                         mobileNumber:
 *                           type: string
 *                           example: 9876543210
 *                         category:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 60d21b4667d0d8992e610c85
 *                             name:
 *                               type: string
 *                               example: Massage Therapies
 *                             type:
 *                               type: string
 *                               example: Massage
 *                         service:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 60d21b4667d0d8992e610c86
 *                             name:
 *                               type: string
 *                               example: Deep Tissue Massage
 *                             photo:
 *                               type: string
 *                               example: https://res.cloudinary.com/demo/image/upload/v123456/spa/service.jpg
 *                             finalPrice:
 *                               type: number
 *                               example: 120
 *                             serviceType:
 *                               type: string
 *                               example: Massage
 *                             description:
 *                               type: string
 *                               example: Thorough deep muscle massage therapy.
 *                         serviceType:
 *                           type: string
 *                           example: VIP
 *                         appointmentDate:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-06-15T10:00:00.000Z
 *                         status:
 *                           type: string
 *                           example: Pending
 *                         orderNumber:
 *                           type: string
 *                           example: SPA-1716215328000-456
 *                         price:
 *                           type: number
 *                           example: 120
 *                         notes:
 *                           type: string
 *                           example: Prefer standard morning session.
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:42:48.000Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:42:48.000Z
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Appointment not found
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
 *                   example: Appointment not found
 *       500:
 *         description: Server error
 */
router.get("/my/:id", protect, c.getAppointmentDetail);
/**
 * @swagger
 * /api/appointments/my/{id}:
 *   put:
 *     summary: Update a pending appointment
 *     description: Update the editable fields of a user's appointment. This is only allowed if the appointment is currently in 'Pending' status.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the appointment.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Jane Doe
 *               address:
 *                 type: string
 *                 example: 789 Wellness Boulevard
 *               state:
 *                 type: string
 *                 example: Maharashtra
 *               country:
 *                 type: string
 *                 example: India
 *               mobileNumber:
 *                 type: string
 *                 example: 9876543211
 *               serviceType:
 *                 type: string
 *                 enum: [Normal, High, VIP, VVIP]
 *                 example: VVIP
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-06-16T14:30:00.000Z
 *               notes:
 *                 type: string
 *                 example: Please adjust time slightly if there is a conflict.
 *     responses:
 *       200:
 *         description: Appointment updated successfully
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
 *                   example: Appointment updated
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c87
 *                         user:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c84
 *                         fullName:
 *                           type: string
 *                           example: Jane Doe
 *                         address:
 *                           type: string
 *                           example: 789 Wellness Boulevard
 *                         state:
 *                           type: string
 *                           example: Maharashtra
 *                         country:
 *                           type: string
 *                           example: India
 *                         mobileNumber:
 *                           type: string
 *                           example: 9876543211
 *                         category:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c85
 *                         service:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c86
 *                         serviceType:
 *                           type: string
 *                           example: VVIP
 *                         appointmentDate:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-06-16T14:30:00.000Z
 *                         status:
 *                           type: string
 *                           example: Pending
 *                         orderNumber:
 *                           type: string
 *                           example: SPA-1716215328000-456
 *                         price:
 *                           type: number
 *                           example: 120
 *                         notes:
 *                           type: string
 *                           example: Please adjust time slightly if there is a conflict.
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:42:48.000Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:50:00.000Z
 *       400:
 *         description: Bad request (e.g. appointment is not in Pending status)
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
 *                   example: Cannot edit appointment with status 'Approved'. Only Pending appointments can be edited.
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.put("/my/:id", protect, c.updateAppointment);
/**
 * @swagger
 * /api/appointments/my/cancel/{id}:
 *   put:
 *     summary: Cancel a pending or requested appointment
 *     description: Cancel an appointment belonging to the user. This is only allowed if the appointment has not yet been approved (i.e. status is Pending). Once cancelled, a notification is sent to the user.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the appointment.
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
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
 *                   example: Appointment cancelled
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c87
 *                         user:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c84
 *                         fullName:
 *                           type: string
 *                           example: Jane Doe
 *                         address:
 *                           type: string
 *                           example: 456 Luxury Suite Rd
 *                         state:
 *                           type: string
 *                           example: Gujarat
 *                         country:
 *                           type: string
 *                           example: India
 *                         mobileNumber:
 *                           type: string
 *                           example: 9876543210
 *                         category:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c85
 *                         service:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c86
 *                         serviceType:
 *                           type: string
 *                           example: VIP
 *                         appointmentDate:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-06-15T10:00:00.000Z
 *                         status:
 *                           type: string
 *                           example: Cancelled
 *                         orderNumber:
 *                           type: string
 *                           example: SPA-1716215328000-456
 *                         price:
 *                           type: number
 *                           example: 120
 *                         notes:
 *                           type: string
 *                           example: Prefer standard morning session.
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:42:48.000Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:51:00.000Z
 *       400:
 *         description: Bad request (e.g. appointment already approved or cancelled)
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
 *                   example: Cannot cancel an already approved appointment
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.put("/my/cancel/:id", protect, c.cancelAppointment);
/**
 * @swagger
 * /api/appointments/my/{id}:
 *   delete:
 *     summary: Delete a single appointment
 *     description: Permanently remove a specific appointment record belonging to the logged-in user.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the appointment.
 *     responses:
 *       200:
 *         description: Appointment deleted successfully
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
 *                   example: Appointment deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Appointment not found
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
 *                   example: Appointment not found
 *       500:
 *         description: Server error
 */
router.delete("/my/:id", protect, c.deleteAppointment);

// ─── Admin Routes ─────────────────────────────────────────────

/**
 * @swagger
 * /api/appointments/admin/all:
 *   get:
 *     summary: Fetch all system appointments (Admin Only)
 *     description: Retrieve a list of all appointments booked in the entire system, sorted by newest first. Admins can optionally filter the results by status.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected, Cancelled]
 *         description: Optional status to filter appointments by.
 *     responses:
 *       200:
 *         description: Successfully fetched all system appointments.
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
 *                   example: All appointments fetched
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 12
 *                     appointments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 60d21b4667d0d8992e610c87
 *                           user:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 60d21b4667d0d8992e610c84
 *                               name:
 *                                 type: string
 *                                 example: Jane Doe
 *                               email:
 *                                 type: string
 *                                 example: jane@example.com
 *                               mobileNumber:
 *                                 type: string
 *                                 example: 9876543210
 *                               profileImage:
 *                                 type: string
 *                                 example: https://res.cloudinary.com/demo/image/upload/v123456/profile.jpg
 *                           fullName:
 *                             type: string
 *                             example: Jane Doe
 *                           address:
 *                             type: string
 *                             example: 456 Luxury Suite Rd
 *                           state:
 *                             type: string
 *                             example: Gujarat
 *                           country:
 *                             type: string
 *                             example: India
 *                           mobileNumber:
 *                             type: string
 *                             example: 9876543210
 *                           category:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 60d21b4667d0d8992e610c85
 *                               name:
 *                                 type: string
 *                                 example: Massage Therapies
 *                               type:
 *                                 type: string
 *                                 example: Massage
 *                           service:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 60d21b4667d0d8992e610c86
 *                               name:
 *                                 type: string
 *                                 example: Deep Tissue Massage
 *                               photo:
 *                                 type: string
 *                                 example: https://res.cloudinary.com/demo/image/upload/v123456/spa/service.jpg
 *                               finalPrice:
 *                                 type: number
 *                                 example: 120
 *                               serviceType:
 *                                 type: string
 *                                 example: Massage
 *                           serviceType:
 *                             type: string
 *                             example: VIP
 *                           appointmentDate:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-06-15T10:00:00.000Z
 *                           status:
 *                             type: string
 *                             example: Pending
 *                           orderNumber:
 *                             type: string
 *                             example: SPA-1716215328000-456
 *                           price:
 *                             type: number
 *                             example: 120
 *                           notes:
 *                             type: string
 *                             example: Prefer standard morning session.
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-05-20T16:42:48.000Z
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-05-20T16:42:48.000Z
 *       401:
 *         description: Not authorized (Invalid/Expired Token).
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
 *                   example: Not authorized, token failed
 *       403:
 *         description: Forbidden (User is not an admin).
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
 *                   example: Admin resource. Access denied
 *       500:
 *         description: Internal server error.
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
 *                   example: Database connection timed out
 */
router.get("/admin/all", protect, adminOnly, c.adminGetAllAppointments);
/**
 * @swagger
 * /api/appointments/admin/{id}:
 *   get:
 *     summary: Fetch single appointment detail (Admin Only)
 *     description: Retrieve detailed information about a specific appointment in the system by its ID. Includes full details on the booking user, including their geo-location.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the appointment.
 *     responses:
 *       200:
 *         description: Appointment details fetched successfully.
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
 *                   example: Appointment detail
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c87
 *                         user:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 60d21b4667d0d8992e610c84
 *                             name:
 *                               type: string
 *                               example: Jane Doe
 *                             email:
 *                               type: string
 *                               example: jane@example.com
 *                             mobileNumber:
 *                               type: string
 *                               example: 9876543210
 *                             profileImage:
 *                               type: string
 *                               example: https://res.cloudinary.com/demo/image/upload/v123456/profile.jpg
 *                             location:
 *                               type: object
 *                               properties:
 *                                 type:
 *                                   type: string
 *                                   example: Point
 *                                 coordinates:
 *                                   type: array
 *                                   items:
 *                                     type: number
 *                                   example: [72.5714, 23.0225]
 *                         fullName:
 *                           type: string
 *                           example: Jane Doe
 *                         address:
 *                           type: string
 *                           example: 456 Luxury Suite Rd
 *                         state:
 *                           type: string
 *                           example: Gujarat
 *                         country:
 *                           type: string
 *                           example: India
 *                         mobileNumber:
 *                           type: string
 *                           example: 9876543210
 *                         category:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 60d21b4667d0d8992e610c85
 *                             name:
 *                               type: string
 *                               example: Massage Therapies
 *                             type:
 *                               type: string
 *                               example: Massage
 *                         service:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 60d21b4667d0d8992e610c86
 *                             name:
 *                               type: string
 *                               example: Deep Tissue Massage
 *                             photo:
 *                               type: string
 *                               example: https://res.cloudinary.com/demo/image/upload/v123456/spa/service.jpg
 *                             finalPrice:
 *                               type: number
 *                               example: 120
 *                             serviceType:
 *                               type: string
 *                               example: Massage
 *                             description:
 *                               type: string
 *                               example: Thorough deep muscle massage therapy.
 *                         serviceType:
 *                           type: string
 *                           example: VIP
 *                         appointmentDate:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-06-15T10:00:00.000Z
 *                         status:
 *                           type: string
 *                           example: Pending
 *                         orderNumber:
 *                           type: string
 *                           example: SPA-1716215328000-456
 *                         price:
 *                           type: number
 *                           example: 120
 *                         notes:
 *                           type: string
 *                           example: Prefer standard morning session.
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:42:48.000Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:42:48.000Z
 *       401:
 *         description: Not authorized (Invalid/Expired Token).
 *       403:
 *         description: Forbidden (User is not an admin).
 *       404:
 *         description: Appointment not found.
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
 *                   example: Appointment not found
 *       500:
 *         description: Internal server error.
 */
router.get("/admin/:id", protect, adminOnly, c.adminGetAppointmentDetail);
/**
 * @swagger
 * /api/appointments/admin/{id}/status:
 *   put:
 *     summary: Update appointment status (Admin Only)
 *     description: Update the status of a specific appointment. Must be Approved, Rejected, or Pending. Modifying the status triggers appropriate in-app notifications to the booking user.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the appointment.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Approved, Rejected, Pending]
 *                 example: Approved
 *     responses:
 *       200:
 *         description: Appointment status updated successfully.
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
 *                   example: Appointment status updated to 'Approved'
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c87
 *                         user:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c84
 *                         fullName:
 *                           type: string
 *                           example: Jane Doe
 *                         address:
 *                           type: string
 *                           example: 456 Luxury Suite Rd
 *                         state:
 *                           type: string
 *                           example: Gujarat
 *                         country:
 *                           type: string
 *                           example: India
 *                         mobileNumber:
 *                           type: string
 *                           example: 9876543210
 *                         category:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c85
 *                         service:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c86
 *                         serviceType:
 *                           type: string
 *                           example: VIP
 *                         appointmentDate:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-06-15T10:00:00.000Z
 *                         status:
 *                           type: string
 *                           example: Approved
 *                         orderNumber:
 *                           type: string
 *                           example: SPA-1716215328000-456
 *                         price:
 *                           type: number
 *                           example: 120
 *                         notes:
 *                           type: string
 *                           example: Prefer standard morning session.
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:42:48.000Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:55:00.000Z
 *       400:
 *         description: Bad request (Invalid status or invalid ObjectId).
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
 *                   example: Status must be Approved, Rejected, or Pending
 *       401:
 *         description: Not authorized.
 *       403:
 *         description: Forbidden (Admin only).
 *       404:
 *         description: Appointment not found.
 *       500:
 *         description: Internal server error.
 */
router.put("/admin/:id/status", protect, adminOnly, c.adminUpdateStatus);

module.exports = router;