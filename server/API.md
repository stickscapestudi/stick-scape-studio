# Stick Scape Studio — Backend API Reference

Production-style Express TypeScript REST API documentation for **Stick Scape Studio**.

---

## 1. PUBLIC ENDPOINTS (No Authentication Required)

### `GET /api/health`
- **Description**: Verifies backend Express service and live PostgreSQL database connectivity.
- **Authentication**: None.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Stick Scape API is running 🚀",
    "database": "connected"
  }
  ```

---

### `GET /api/products`
- **Description**: Retrieves active store products. Supports category and search filtering.
- **Authentication**: None.
- **Query Parameters**:
  - `category` (optional): Filter by category (`posters`, `polaroids`, `bundles`).
  - `search` (optional): Search product name or description.
- **Response** (`200 OK`): Includes `count` and `data` array.

---

### `GET /api/products/:id`
- **Description**: Retrieves a single active product by UUID or slug.
- **Authentication**: None.
- **Errors**: `404 Not Found` if product does not exist or `isActive = false`.

---

### `POST /api/orders`
- **Description**: Customer checkout endpoint. Performs server-side price lookup from PostgreSQL, calculates line totals, subtotal, shipping fee (Free for ≥ ₹999; ₹80 otherwise), generates order number (`SSC-YYYYMMDD-XXXXXX`), and decrements stock in a database transaction.
- **Authentication**: None (Rate Limited: Max 30 requests / 15 mins per IP).
- **Request Body**:
  ```json
  {
    "customerName": "Jane Doe",
    "email": "jane@example.com",
    "mobile": "9876543210",
    "address": "42 Beach Road",
    "city": "Puducherry",
    "state": "Puducherry",
    "postalCode": "605001",
    "paymentMethod": "COD",
    "items": [
      {
        "productId": "prod-01",
        "quantity": 1
      }
    ]
  }
  ```
- **Response** (`201 Created`): Returns created order details.

---

### `GET /api/orders/track/:orderNumber`
- **Description**: Public customer order tracking endpoint. Verifies BOTH `orderNumber` and `mobile` number.
- **Authentication**: None (Rate Limited: Max 60 requests / 15 mins per IP).
- **Query Parameters**:
  - `mobile` (required): Customer phone number.
- **Example**: `GET /api/orders/track/SSC-20260902-BEB9FB?mobile=9876543210`
- **Response** (`200 OK`): Includes safe status, item breakdown, paymentMethod, paymentStatus (`Pending`/`Paid`), subtotal, shipping, and total amount.

---

### `POST /api/auth/login`
- **Description**: Admin authentication endpoint. Validates credentials using `bcrypt.compare`, rate-limited against brute force.
- **Authentication**: None (Rate Limited: Max 15 requests / 15 mins per IP).
- **Request Body**: `{ "email": "admin@stickscape.com", "password": "..." }`
- **Response** (`200 OK`): Returns JWT token & safe admin profile.

---

### `POST /api/payments/create-order`
- **Description**: Initializes an online payment order for an existing backend order. Determines payable amount in **paise** (integers) strictly from PostgreSQL.
- **Authentication**: None.
- **Request Body**: `{ "orderNumber": "SSC-20260902-BEB9FB" }`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "keyId": "rzp_test_...",
      "paymentOrderId": "DEV_PAY_ORDER_SSC-...",
      "amount": 20000,
      "currency": "INR",
      "orderNumber": "SSC-20260902-BEB9FB"
    }
  }
  ```

---

### `POST /api/payments/verify`
- **Description**: Cryptographically verifies payment signature (HMAC-SHA256). Sets `paymentStatus = Paid`, `paidAt = Date`, and advances status to `Processing`. Idempotent against repeat verification.
- **Authentication**: None.
- **Request Body**:
  ```json
  {
    "orderNumber": "SSC-20260902-BEB9FB",
    "paymentOrderId": "DEV_PAY_ORDER_SSC-...",
    "paymentId": "pay_123456",
    "signature": "hmac_sha256_hex_signature"
  }
  ```
- **Response** (`200 OK`): Returns updated order object.
- **Errors**: `400 Bad Request` if signature verification fails. Sets `paymentStatus = Failed`.

---

### `POST /api/payments/webhook`
- **Description**: Asynchronous Razorpay Webhook Handler. Cryptographically validates `x-razorpay-signature` and updates order payment status idempotently.
- **Authentication**: Verified via HMAC Webhook Secret.
- **Response** (`200 OK`): `{ "success": true, "received": true }`

---

## 2. PROTECTED ADMIN ENDPOINTS (Requires `Authorization: Bearer <token>` + `ADMIN` Role)

### `GET /api/orders`
- **Description**: Returns paginated, searchable, and status-filtered orders newest-first.
- **Query Parameters**: `page`, `limit`, `search`, `status`.

---

### `GET /api/orders/number/:orderNumber`
- **Description**: Fetches order specifically by human-readable order number.

---

### `GET /api/orders/:id`
- **Description**: Fetches order details by database UUID or orderNumber.

---

### `PATCH /api/orders/:id/status`
- **Description**: Updates order status following valid state machine rules (`Pending` -> `Processing`/`Cancelled`, `Processing` -> `Shipped`/`Cancelled`, `Shipped` -> `Delivered`).

---

### `GET /api/admin/dashboard/stats`
- **Description**: Calculates live dashboard statistics and total revenue (excluding cancelled orders) directly from PostgreSQL.

---

### `POST /api/products`, `PATCH /api/products/:id`, `DELETE /api/products/:id`
- **Description**: Admin product CRUD & soft-deletion (`isActive = false`).
