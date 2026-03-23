# Yogiraj Enterprises — Backend API

Node.js + Express REST API with MongoDB Atlas and Cloudinary image uploads.

---

## Quick Start

```bash
cd backend
npm install
# Add your credentials to .env (see below)
npm run dev
```

Server starts at: `http://localhost:5000`

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key` |
| `JWT_EXPIRE` | JWT expiry duration | `7d` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:8080` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `dy3yyljpw` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `317814651764892` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `yX2jFKN_...` |
| `ADMIN_SECRET` | Secret required to register admin | `YOGIRAJ_ADMIN_SECRET_2024` |

---

## Default Credentials (Auto-seeded)

| Field | Value |
|---|---|
| Email | `admin@yogiraj.com` |
| Password | `Admin@123` |
| Admin Secret | `YOGIRAJ_ADMIN_SECRET_2024` |

---

## Cloudinary Folder Structure

```
yogiraj/
├── products/      # Product main images & gallery
├── clients/       # Client logos
├── enquiries/     # Enquiry attachments (images, PDFs, CAD files)
├── services/      # Service images
└── specsheets/    # Product spec sheet PDFs (resource_type: raw)
```

---

## API Response Format

```json
// Success (single)
{ "success": true, "data": { ... } }

// Success (list)
{ "success": true, "count": 8, "data": [ ... ] }

// Created
{ "success": true, "data": { ... }, "message": "Created successfully" }

// Error
{ "success": false, "error": "error message" }
```

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/register` | Public | `email, password, name, adminSecret` | Register new admin |
| POST | `/login` | Public | `email, password` | Login, returns JWT |
| GET | `/me` | Bearer | — | Get current admin |

### Products — `/api/products`

| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| GET | `/` | Public | `?category=Gears&material=Steel&search=gear` | List active products |
| GET | `/:id` | Public | ID or slug | Get single product |
| POST | `/` | Bearer | `multipart/form-data` (see below) | Create product |
| PUT | `/:id` | Bearer | `multipart/form-data` | Update product |
| DELETE | `/:id` | Bearer | — | Soft delete product |
| POST | `/:id/gallery` | Bearer | `multipart/form-data` field: `gallery` (max 5) | Add gallery images |
| DELETE | `/:id/gallery/:publicId` | Bearer | publicId URL-encoded | Delete gallery image |
| POST | `/:id/specsheet` | Bearer | `multipart/form-data` field: `specsheet` (PDF) | Upload spec sheet |

**Create/Update Product fields:**
```
name          (string, required)
category      (Gears | Shafts | Bearings | Housings | Brackets)
material      (Steel | Aluminum | Titanium | Custom)
dimensions    (string)
tolerance     (string)
description   (string)
image         (file, jpg/jpeg/png/webp, max 5MB)
```

### Services — `/api/services`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List active services |
| GET | `/:id` | Public | Get single service |
| POST | `/` | Bearer | Create service (multipart, field: `image`) |
| PUT | `/:id` | Bearer | Update service |
| DELETE | `/:id` | Bearer | Soft delete service |

**Service fields:** `title, description, benefits (JSON array), caseStudy (JSON object), icon, order, image (file)`

### Clients — `/api/clients`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List active clients |
| GET | `/:id` | Bearer | Get single client |
| POST | `/` | Bearer | Create client (multipart, field: `logo`) |
| PUT | `/:id` | Bearer | Update client |
| DELETE | `/:id` | Bearer | Soft delete + delete logo |

**Client fields:** `name, industry, testimonial (JSON), order, logo (file, max 2MB)`

### Enquiries — `/api/enquiries`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Public | Submit enquiry (multipart, field: `attachments`, max 5 files × 10MB) |
| GET | `/` | Bearer | List enquiries (`?status=Pending&page=1&limit=20`) |
| GET | `/:id` | Bearer | Get single enquiry |
| PUT | `/:id` | Bearer | Update status/notes/price |
| DELETE | `/:id` | Bearer | Hard delete + Cloudinary cleanup |

**Enquiry POST fields:**
```
company           (string, required)
contactName       (string, required)
email             (string, required)
phone             (string)
partsDescription  (string, required)
quantity          (number)
material          (string)
deadline          (date string)
dimensions        (JSON: { length, width, height, unit })
tolerance         (string)
attachments       (files: jpg/png/pdf/dwg/step/stp/iges/igs/stl)
```

**Enquiry PUT fields:** `status, adminNotes, quotedPrice`

### Contact — `/api/contact`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Public | Send contact message |
| GET | `/` | Bearer | List messages (`?isRead=false&page=1`) |
| PUT | `/:id/read` | Bearer | Mark message as read |
| DELETE | `/:id` | Bearer | Delete message |

**Contact POST fields:** `name (required), company, email (required), phone, message (required)`

### Upload — `/api/upload`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Bearer | Get Cloudinary usage stats |
| DELETE | `/:publicId` | Bearer | Delete asset by publicId (`?type=raw` for PDFs) |

### Health Check

```
GET /api/health  →  { success: true, message: "...", timestamp: "..." }
```

---

## Image Upload — Postman Guide

All file uploads use `multipart/form-data`.

### 1. Login first
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{ "email": "admin@yogiraj.com", "password": "Admin@123" }
```
Copy the `token` from the response.

### 2. Create a product with image
```
POST http://localhost:5000/api/products
Authorization: Bearer <token>
Content-Type: multipart/form-data

name        = Spur Gear Assembly
category    = Gears
material    = Steel
dimensions  = Ø120 × 25mm
tolerance   = ±0.005mm
description = High-precision spur gear...
image       = [select file]
```

### 3. Submit an enquiry with attachments
```
POST http://localhost:5000/api/enquiries
Content-Type: multipart/form-data

company          = AeroTech Inc.
contactName      = Sarah Chen
email            = sarah@aerotech.com
partsDescription = Custom gear assembly for turbine
quantity         = 500
attachments      = [select up to 5 files]
```

### 4. Upload gallery images
```
POST http://localhost:5000/api/products/:id/gallery
Authorization: Bearer <token>
Content-Type: multipart/form-data

gallery = [select up to 5 images]
```

### 5. Upload spec sheet PDF
```
POST http://localhost:5000/api/products/:id/specsheet
Authorization: Bearer <token>
Content-Type: multipart/form-data

specsheet = [select PDF file]
```

---

## File Size & Format Limits

| Upload Type | Field | Formats | Max Size | Max Files |
|---|---|---|---|---|
| Product image | `image` | jpg, jpeg, png, webp | 5MB | 1 |
| Product gallery | `gallery` | jpg, jpeg, png, webp | 5MB each | 5 |
| Client logo | `logo` | jpg, jpeg, png, webp, svg | 2MB | 1 |
| Enquiry attachments | `attachments` | jpg, png, pdf, dwg, step, stp, iges, igs, stl | 10MB each | 5 |
| Service image | `image` | jpg, jpeg, png, webp | 5MB | 1 |
| Spec sheet | `specsheet` | pdf | 10MB | 1 |

---

## Scripts

```bash
npm run dev    # Start with nodemon (auto-reload)
npm start      # Start production server
npm run seed   # Run seed data manually
```
