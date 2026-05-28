# 💆 SPA Management System — Backend API

Production-level REST API built with **Node.js**, **Express.js**, **MongoDB**, and **Cloudinary**.

---

## 🚀 Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env  # Fill in your MONGO_URI, JWT_SECRET, CLOUDINARY credentials

# 3. Start development server
npm run dev

# 4. Start production server
npm start
```

---

## 📁 Project Structure

```
spa-management/
├── config/
│   └── db.js                    # MongoDB connection
├── models/
│   ├── User.js                  # User schema (role stored in DB)
│   ├── Category.js              # Category schema
│   ├── Service.js               # Service schema (auto finalPrice)
│   ├── Appointment.js           # Appointment schema (auto orderNumber)
│   └── Notification.js         # Notification schema
├── middleware/
│   ├── auth.js                  # JWT protect + adminOnly
│   ├── upload.js                # Cloudinary multer config
│   └── errorHandler.js          # Global error handler
├── controllers/
│   ├── auth.controller.js       # Register, Login
│   ├── home.controller.js       # Categories, Services, Slider
│   ├── appointment.controller.js# Book, List, Update, Status
│   ├── notification.controller.js# Notification history
│   ├── profile.controller.js    # Get/Update profile
│   └── admin.controller.js      # Dashboard, User management
├── routes/
│   ├── auth.routes.js
│   ├── home.routes.js
│   ├── appointment.routes.js
│   ├── notification.routes.js
│   ├── profile.routes.js
│   └── admin.routes.js
├── utils/
│   └── response.js              # sendSuccess / sendError helpers
├── .env
├── app.js
├── server.js
└── package.json
```

---

## 🔐 Role System

| Role    | Set By          | How                          |
|---------|-----------------|------------------------------|
| `user`  | Auto on register| Default in schema            |
| `admin` | Via Admin API   | `PUT /api/admin/users/:id/role` |

> ⚠️ Role is **NEVER** accepted from `req.body`. It is always read from MongoDB.

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api
```

### Response Format
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Auth Header
```
Authorization: Bearer <token>
```

---

### 🔑 Auth APIs

| Method | Endpoint           | Auth | Description             |
|--------|--------------------|------|-------------------------|
| POST   | `/auth/register`   | ❌   | Register new user       |
| POST   | `/auth/login`      | ❌   | Login (email or mobile) |

**Register** `POST /auth/register` — form-data
```
name        (required)
email       (required if no mobileNumber)
mobileNumber(required if no email)
password    (required, min 6 chars)
age
gender      (male/female/other)
country
state
latitude
longitude
faceScreenshot (file, optional)
```

**Login** `POST /auth/login` — JSON
```json
{
  "email": "user@example.com",
  "password": "pass123",
  "latitude": 23.02,
  "longitude": 72.57
}
```

---

### 🏠 Home APIs

| Method | Endpoint                   | Auth  | Role  | Description              |
|--------|----------------------------|-------|-------|--------------------------|
| GET    | `/home/slider`             | ✅    | User  | Home screen slider       |
| POST   | `/home/categories`         | ✅    | Admin | Add category             |
| PUT    | `/home/categories/:id`     | ✅    | Admin | Update category          |
| DELETE | `/home/categories/:id`     | ✅    | Admin | Delete category          |
| GET    | `/home/categories`         | ✅    | User  | List categories          |
| POST   | `/home/services`           | ✅    | Admin | Add service (form-data)  |
| PUT    | `/home/services/:id`       | ✅    | Admin | Update service           |
| DELETE | `/home/services/:id`       | ✅    | Admin | Delete service           |
| GET    | `/home/services`           | ✅    | User  | List services            |
| GET    | `/home/services/:id`       | ✅    | User  | Service detail           |

**Category types:** `trending` | `popular` | `recent` | `all`

**Service types:** `Normal` | `High` | `VIP` | `VVIP`

**Add Service** `POST /home/services` — form-data
```
photo         (file, required)
name          (required)
description   (required)
price         (required)
discount      (e.g. 10 for 10% off)
title
categoryId    (required)
serviceType   (Normal/High/VIP/VVIP)
```

---

### 📅 Appointment APIs

| Method | Endpoint                         | Auth | Role  | Description               |
|--------|----------------------------------|------|-------|---------------------------|
| POST   | `/appointments/book`             | ✅   | User  | Book appointment          |
| GET    | `/appointments/my`               | ✅   | User  | My appointments           |
| GET    | `/appointments/my/:id`           | ✅   | User  | Appointment detail        |
| PUT    | `/appointments/my/:id`           | ✅   | User  | Edit (only if Pending)    |
| PUT    | `/appointments/my/:id/cancel`    | ✅   | User  | Cancel appointment        |
| DELETE | `/appointments/my/:id`           | ✅   | User  | Delete one                |
| DELETE | `/appointments/my/all`           | ✅   | User  | Delete all                |
| GET    | `/appointments/admin/all`        | ✅   | Admin | All appointments          |
| GET    | `/appointments/admin/:id`        | ✅   | Admin | Appointment detail        |
| PUT    | `/appointments/admin/:id/status` | ✅   | Admin | Approve / Reject          |

**Book Appointment** `POST /appointments/book` — JSON
```json
{
  "fullName": "John Doe",
  "address": "123 Main St",
  "state": "Gujarat",
  "country": "India",
  "mobileNumber": "9876543210",
  "categoryId": "objectId",
  "serviceId": "objectId",
  "serviceType": "VIP",
  "appointmentDate": "2026-06-15T10:00:00Z",
  "notes": "Prefer morning session"
}
```

**Status Flow:**
```
Pending → Approved  (by Admin)
Pending → Rejected  (by Admin)
Pending → Cancelled (by User)
```

---

### 🔔 Notification APIs

| Method | Endpoint                     | Auth | Description          |
|--------|------------------------------|------|----------------------|
| GET    | `/notifications`             | ✅   | All + unread count   |
| PUT    | `/notifications/read-all`    | ✅   | Mark all read        |
| PUT    | `/notifications/:id/read`    | ✅   | Mark one read        |
| DELETE | `/notifications/all`         | ✅   | Delete all           |
| DELETE | `/notifications/:id`         | ✅   | Delete one           |

---

### 👤 Profile APIs

| Method | Endpoint                       | Auth | Description        |
|--------|--------------------------------|------|--------------------|
| GET    | `/profile`                     | ✅   | Get my profile     |
| PUT    | `/profile`                     | ✅   | Update profile     |
| PUT    | `/profile/change-password`     | ✅   | Change password    |

**Update Profile** `PUT /profile` — form-data
```
name
age
gender
country
state
mobileNumber
profileImage  (file, optional)
```

---

### ⚙️ Admin APIs

| Method | Endpoint                           | Auth | Role  | Description            |
|--------|------------------------------------|------|-------|------------------------|
| GET    | `/admin/dashboard`                 | ✅   | Admin | Stats overview         |
| GET    | `/admin/users`                     | ✅   | Admin | All users              |
| GET    | `/admin/users/:id`                 | ✅   | Admin | User detail            |
| PUT    | `/admin/users/:id/role`            | ✅   | Admin | Assign role from DB    |
| PUT    | `/admin/users/:id/toggle-status`   | ✅   | Admin | Activate/Deactivate    |
| DELETE | `/admin/users/:id`                 | ✅   | Admin | Delete user + data     |

**Assign Role** `PUT /admin/users/:id/role` — JSON
```json
{ "role": "admin" }
```

---

## 🗄️ Database Relationships

```
User ──────────────────── Appointment (one-to-many)
User ──────────────────── Notification (one-to-many)
Category ──────────────── Service (one-to-many)
Category ──────────────── Appointment (one-to-many)
Service ───────────────── Appointment (one-to-many)
Appointment ───────────── Notification (one-to-one)
```

---

## 🌩️ Cloudinary Folders

```
spa-management/
├── services/       ← Service photos
├── profiles/       ← User profile images
└── faces/          ← Face screenshots (registration)
```