# DriveElite API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication
Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth APIs

### POST `/api/auth/register`
Register a new user account.

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "1234567890"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
- `400` — Missing required fields / User already exists / Password too short
- `500` — Server error

---

### POST `/api/auth/login`
Authenticate and receive a JWT token.

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": { "_id": "...", "name": "...", "email": "...", "phone": "...", "role": "user" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
- `400` — Missing email or password
- `401` — Invalid email or password
- `500` — Server error

---

### GET `/api/auth/profile`
Get the authenticated user's profile.

**Access:** Protected (Bearer Token)

**Success Response (200):**
```json
{
  "success": true,
  "user": { "_id": "...", "name": "...", "email": "...", "phone": "...", "role": "user" }
}
```

**Error Responses:**
- `401` — Not authorized / Token invalid
- `404` — User not found

---

### PUT `/api/auth/update-profile`
Update user profile (name, phone, password).

**Access:** Protected (Bearer Token)

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "9876543210",
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```
> Note: `currentPassword` and `newPassword` are only required when changing password.

**Success Response (200):**
```json
{
  "success": true,
  "user": { "_id": "...", "name": "Updated Name", "email": "...", "phone": "9876543210", "role": "user" },
  "message": "Profile updated successfully"
}
```

**Error Responses:**
- `400` — Current password incorrect / New password too short
- `401` — Not authorized
- `500` — Server error

---

## Payment APIs

### POST `/api/payment/create-order`
Create a Razorpay order for payment.

**Access:** Public

**Request Body:**
```json
{
  "amount": 1500.00
}
```

**Success Response (200):**
```json
{
  "success": true,
  "order": {
    "id": "order_...",
    "amount": 150000,
    "currency": "INR",
    "receipt": "receipt_...",
    "status": "created"
  }
}
```

**Error Responses:**
- `400` — Invalid amount
- `500` — Razorpay API error

---

### POST `/api/payment/verify`
Verify Razorpay payment and create booking.

**Access:** Public (optionally authenticated)

**Request Body:**
```json
{
  "razorpay_order_id": "order_...",
  "razorpay_payment_id": "pay_...",
  "razorpay_signature": "...",
  "amount": 1500.00,
  "reservationDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "pickup": "123 Main St",
    "destination": "Airport",
    "date": "June 15, 2026",
    "time": "10:00 AM",
    "rideOption": "One Way",
    "numberPassengers": 2,
    "carChoice": "Black Suburban 2024",
    "seatOption": "",
    "airlinename": "",
    "flightnumber": "",
    "hourlyservice": ""
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment verified and booking confirmed",
  "data": {
    "bookingId": "DE-A1B2C3D4",
    "paymentStatus": "Paid",
    "bookingStatus": "Confirmed"
  }
}
```

**Error Responses:**
- `400` — Missing fields / Invalid signature
- `500` — Server error

---

## Booking APIs

### GET `/api/bookings`
Get authenticated user's bookings.

**Access:** Protected (Bearer Token)

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max 50) |
| status | string | — | Filter: Confirmed, InProgress, Completed, Cancelled |

**Success Response (200):**
```json
{
  "success": true,
  "data": [{ "bookingId": "DE-...", "..." : "..." }],
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

---

### POST `/api/bookings/create`
Create a booking directly (without payment flow).

**Access:** Public (optionally authenticated)

**Request Body:** Same fields as payment verify reservation details.

---

### GET `/api/bookings/[id]`
Get single booking details.

**Access:** Protected (owner or admin)

---

### PUT `/api/bookings/[id]`
Cancel a booking.

**Access:** Protected (owner)

**Request Body:**
```json
{
  "action": "cancel",
  "cancelReason": "Change of plans"
}
```

---

## Admin APIs

### GET `/api/admin/bookings`
List all bookings.
**Access:** Admin only

### PUT `/api/admin/bookings`
Update booking payment status.
**Access:** Admin only
```json
{ "bookingId": "...", "paymentStatus": "Completed" }
```

### DELETE `/api/admin/bookings`
Delete a booking.
**Access:** Admin only
```json
{ "bookingId": "..." }
```

---

### GET `/api/admin/vehicles`
List all vehicles. **Access:** Admin only

### POST `/api/admin/vehicles`
Add vehicle. **Access:** Admin only
```json
{ "type": "SUV", "price_per_km": 15, "price_per_hour": 500 }
```

### PUT `/api/admin/vehicles`
Update vehicle. **Access:** Admin only

### DELETE `/api/admin/vehicles`
Delete vehicle. **Access:** Admin only

---

### GET `/api/admin/users`
List all users. **Access:** Admin only

### PUT `/api/admin/users`
Update user role. **Access:** Admin only
```json
{ "userId": "...", "role": "admin" }
```

---

## Utility APIs

### POST `/api/calculate`
Calculate ride price based on distance/hourly.
**Access:** Public
```json
{
  "origins": "123 Main St, City",
  "destinations": "Airport, City",
  "rideOption": "One Way",
  "selectTime": "10:00 AM"
}
```

### GET `/api/ride`
Get all ride types. **Access:** Public

### GET `/api/vehicles`
Get all vehicles with pricing. **Access:** Public

### GET `/api/drivers`
Get all drivers. **Access:** Public

### POST `/api/query`
Submit a contact query. **Access:** Public
```json
{ "name": "...", "email": "...", "phone": "...", "message": "..." }
```
