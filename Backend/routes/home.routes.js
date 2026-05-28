const express = require("express");
const router = express.Router();
const c = require("../controllers/home.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/upload.middleware");

/**
 * @swagger
 * tags:
 *   name: Home
 *   description: Category, Service, and Homepage management
 */

// ─── Slider ──────────────────────────────────────────
/**
 * @swagger
 * /api/home/slider:
 *   get:
 *     summary: Get slider services (Latest 10 active services)
 *     description: Retrieve the top 10 newest active services to populate the landing page carousel/slider.
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Slider data fetched successfully
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
 *                   example: Slider data fetched
 *                 data:
 *                   type: object
 *                   properties:
 *                     services:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 60d21b4667d0d8992e610c86
 *                           name:
 *                             type: string
 *                             example: Deep Tissue Massage
 *                           title:
 *                             type: string
 *                             example: Pure Relaxation
 *                           photo:
 *                             type: string
 *                             example: https://res.cloudinary.com/demo/image/upload/v123456/spa/service.jpg
 *                           price:
 *                             type: number
 *                             example: 120
 *                           discount:
 *                             type: number
 *                             example: 10
 *                           finalPrice:
 *                             type: number
 *                             example: 108
 *                           serviceType:
 *                             type: string
 *                             example: Normal
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
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get("/slider", c.getSlider);

// ─── Categories ──────────────────────────────────────
/**
 * @swagger
 * /api/home/add-category:
 *   post:
 *     summary: Add a new category (Admin Only)
 *     description: Create a new service category. Category name must be unique.
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Unique category name
 *                 example: Massage Therapies
 *               type:
 *                 type: string
 *                 enum: ["Massage Therapies", "Facials & Skincare", "Body Treatments", "Nail Care", "Salon & Waxing", "Spa Packages", "Specialty/Med-Spa Treatments"]
 *                 description: System-defined category classification type
 *                 example: Massage Therapies
 *               description:
 *                 type: string
 *                 description: Brief description of what services are in this category
 *                 example: Relaxing massage therapies for wellness.
 *     responses:
 *       201:
 *         description: Category added successfully
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
 *                   example: Category added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     name:
 *                       type: string
 *                       example: Massage Therapies
 *                     type:
 *                       type: string
 *                       example: Massage Therapies
 *                     description:
 *                       type: string
 *                       example: Relaxing massage therapies for wellness.
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-05-20T16:50:30.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-05-20T16:50:30.000Z
 *       400:
 *         description: Validation error / Category already exists
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
 *                   example: Category with this name already exists
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only access
 *       500:
 *         description: Server error
 */
router.post("/add-category", protect, adminOnly, c.addCategory);
/**
 * @swagger
 * /api/home/update-category/{id}:
 *   put:
 *     summary: Update an existing category (Admin Only)
 *     description: Update details of an existing category by its unique ID.
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Massage Therapies Premium
 *               type:
 *                 type: string
 *                 enum: ["Massage Therapies", "Facials & Skincare", "Body Treatments", "Nail Care", "Salon & Waxing", "Spa Packages", "Specialty/Med-Spa Treatments"]
 *                 example: Massage Therapies
 *               description:
 *                 type: string
 *                 example: Advanced skin rejuvenation facials.
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Category updated successfully
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
 *                   example: Category updated
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c85
 *                         name:
 *                           type: string
 *                           example: Massage Therapies Premium
 *                         type:
 *                           type: string
 *                           example: Massage Therapies
 *                         description:
 *                           type: string
 *                           example: Advanced skin rejuvenation facials.
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:50:30.000Z
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-05-20T16:52:00.000Z
 *       400:
 *         description: Bad request
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only access
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.put("/update-category/:id", protect, adminOnly, c.updateCategory);
/**
 * @swagger
 * /api/home/delete-category/{id}:
 *   delete:
 *     summary: Delete a category (Admin Only)
 *     description: Permanently remove a service category from the system by ID.
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category MongoDB ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
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
 *                   example: Category deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     name:
 *                       type: string
 *                       example: Massage Therapies
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only access
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete("/delete-category/:id", protect, adminOnly, c.deleteCategory);
/**
 * @swagger
 * /api/home/category:
 *   get:
 *     summary: Fetch categories list
 *     description: Retrieve categories list. Supports page/limit pagination and optional classification type filtering. Automatically populates basic associated services info.
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Optional category classification type to filter by
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Total items returned per page
 *     responses:
 *       200:
 *         description: Categories fetched successfully
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
 *                   example: Categories fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 60d21b4667d0d8992e610c85
 *                       name:
 *                         type: string
 *                         example: Massage Therapies
 *                       type:
 *                         type: string
 *                         example: Massage Therapies
 *                       description:
 *                         type: string
 *                         example: Relaxing massage therapies for wellness.
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       services:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 60d21b4667d0d8992e610c86
 *                             name:
 *                               type: string
 *                               example: Deep Tissue Massage
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get("/category", c.getCategories);

// ─── Services ────────────────────────────────────────
/**
 * @swagger
 * /api/home/add-service:
 *   post:
 *     summary: Add a new service (Admin Only)
 *     description: Create a new spa service with an image upload. finalPrice is auto-computed based on price and discount percentage.
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *               - name
 *               - description
 *               - price
 *               - categoryId
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Image file representing the service
 *               name:
 *                 type: string
 *                 example: Swedish Massage
 *               description:
 *                 type: string
 *                 example: A relaxing full body massage using traditional Swedish techniques.
 *               price:
 *                 type: number
 *                 description: Base cost of the service
 *                 example: 80
 *               discount:
 *                 type: number
 *                 description: Discount percentage value (0 to 100)
 *                 example: 10
 *               title:
 *                 type: string
 *                 description: Promotional subtitle
 *                 example: Pure Relaxation
 *               categoryId:
 *                 type: string
 *                 description: The Mongoose ObjectId of the associated category
 *                 example: 60d21b4667d0d8992e610c85
 *               serviceType:
 *                 type: string
 *                 enum: [Normal, High, VIP, VVIP]
 *                 default: Normal
 *                 example: Normal
 *     responses:
 *       201:
 *         description: Service added successfully
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
 *                   example: Service added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c86
 *                         name:
 *                           type: string
 *                           example: Swedish Massage
 *                         photo:
 *                           type: string
 *                           example: https://res.cloudinary.com/demo/image/upload/v123456/spa/service.jpg
 *                         description:
 *                           type: string
 *                           example: A relaxing full body massage using traditional Swedish techniques.
 *                         price:
 *                           type: number
 *                           example: 80
 *                         discount:
 *                           type: number
 *                           example: 10
 *                         finalPrice:
 *                           type: number
 *                           example: 72
 *                         title:
 *                           type: string
 *                           example: Pure Relaxation
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
 *                               example: Massage Therapies
 *                         serviceType:
 *                           type: string
 *                           example: Normal
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *       400:
 *         description: Validation / Bad request error
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only access
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.post("/add-service", protect, adminOnly, upload.single("photo"), c.addService);
/**
 * @swagger
 * /api/home/update-service/{id}:
 *   put:
 *     summary: Update an existing service (Admin Only)
 *     description: Update details of an existing service by ID. Uploading a new image will automatically clean up the old one from Cloudinary.
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service MongoDB ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: New service photo file (optional)
 *               name:
 *                 type: string
 *                 example: Swedish Massage Luxury
 *               description:
 *                 type: string
 *                 example: Upgraded luxury full body massage.
 *               price:
 *                 type: number
 *                 example: 120
 *               discount:
 *                 type: number
 *                 example: 15
 *               title:
 *                 type: string
 *                 example: Ultimate Relaxation
 *               categoryId:
 *                 type: string
 *                 example: 60d21b4667d0d8992e610c85
 *               serviceType:
 *                 type: string
 *                 enum: [Normal, High, VIP, VVIP]
 *                 example: VIP
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Service updated successfully
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
 *                   example: Service updated
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c86
 *                         name:
 *                           type: string
 *                           example: Swedish Massage Luxury
 *                         photo:
 *                           type: string
 *                           example: https://res.cloudinary.com/demo/image/upload/v123456/spa/service_new.jpg
 *                         description:
 *                           type: string
 *                           example: Upgraded luxury full body massage.
 *                         price:
 *                           type: number
 *                           example: 120
 *                         discount:
 *                           type: number
 *                           example: 15
 *                         finalPrice:
 *                           type: number
 *                           example: 102
 *                         title:
 *                           type: string
 *                           example: Ultimate Relaxation
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
 *                               example: Massage Therapies
 *                         serviceType:
 *                           type: string
 *                           example: VIP
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only access
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.put("/update-service/:id", protect, adminOnly, upload.single("photo"), c.updateService);
/**
 * @swagger
 * /api/home/delete-service/{id}:
 *   delete:
 *     summary: Delete a service (Admin Only)
 *     description: Permanently remove a service from the system and delete its photo asset from Cloudinary storage.
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service MongoDB ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
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
 *                   example: Service deleted
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only access
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.delete("/delete-service/:id", protect, adminOnly, c.deleteService);
/**
 * @swagger
 * /api/home/services:
 *   get:
 *     summary: Fetch active services list
 *     description: Retrieve all active (isActive=true) spa services. Supports optional category ID and case-insensitive service type filtering.
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Optional Category ID to filter services
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *         description: Optional service type tier filter (e.g. "Normal", "High", "VIP", "VVIP")
 *     responses:
 *       200:
 *         description: Services fetched successfully
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
 *                   example: Services fetched
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 2
 *                     services:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 60d21b4667d0d8992e610c86
 *                           name:
 *                             type: string
 *                             example: Deep Tissue Massage
 *                           photo:
 *                             type: string
 *                             example: https://res.cloudinary.com/demo/image/upload/v123456/spa/service.jpg
 *                           description:
 *                             type: string
 *                             example: Thorough deep muscle massage therapy.
 *                           price:
 *                             type: number
 *                             example: 120
 *                           discount:
 *                             type: number
 *                             example: 0
 *                           finalPrice:
 *                             type: number
 *                             example: 120
 *                           title:
 *                             type: string
 *                             example: Deep Tissue Specialists
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
 *                                 example: Massage Therapies
 *                           serviceType:
 *                             type: string
 *                             example: VIP
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get("/services", c.getServices);
/**
 * @swagger
 * /api/home/service/{id}:
 *   get:
 *     summary: Fetch single service detail
 *     description: Retrieve detailed specifications of an active spa service by its ID, populating its category information.
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service MongoDB ID
 *     responses:
 *       200:
 *         description: Service detail fetched successfully
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
 *                   example: Service detail
 *                 data:
 *                   type: object
 *                   properties:
 *                     service:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d21b4667d0d8992e610c86
 *                         name:
 *                           type: string
 *                           example: Deep Tissue Massage
 *                         photo:
 *                           type: string
 *                           example: https://res.cloudinary.com/demo/image/upload/v123456/spa/service.jpg
 *                         description:
 *                           type: string
 *                           example: Thorough deep muscle massage therapy.
 *                         price:
 *                           type: number
 *                           example: 120
 *                         discount:
 *                           type: number
 *                           example: 0
 *                         finalPrice:
 *                           type: number
 *                           example: 120
 *                         title:
 *                           type: string
 *                           example: Deep Tissue Specialists
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
 *                               example: Massage Therapies
 *                         serviceType:
 *                           type: string
 *                           example: VIP
 *                         isActive:
 *                           type: boolean
 *                           example: true
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
router.get("/service/:id", c.getServiceDetail);
router.get("/services/:id", c.getServiceDetail);

module.exports = router;