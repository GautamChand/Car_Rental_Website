![image](images/carRentalhome.png)
# DriveElite
<div align="center">

### **Premium Luxury Transportation & Chauffeur Booking Platform**

*A modern full-stack web application for booking premium chauffeur-driven transportation with dynamic pricing, secure authentication, and comprehensive fleet management.*

---

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge\&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge\&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge\&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge\&logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-blue?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styled-38B2AC?style=for-the-badge\&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

**DriveElite** is a production-style luxury transportation platform designed for premium chauffeur services. The platform enables customers to book rides, receive real-time price estimates, explore an exclusive fleet, and manage reservations through a responsive and intuitive interface. Administrators can manage bookings, vehicles, pricing, drivers, and customer information through a secure dashboard.

</div>

---

# :) Table of Contents

* Overview
* Key Features
* Technology Stack
* System Architecture
* Project Structure
* Booking Workflow
* Pricing Engine
* Authentication & Security
* Database Design
* Screenshots
* Installation
* Environment Variables
* Running the Application
* API Documentation
* Deployment
* Future Enhancements
* Contributing
* License

---

# :) Overview

DriveElite was developed as a modern transportation management platform capable of handling the complete lifecycle of premium ride reservations.

The project demonstrates full-stack development practices including secure authentication, REST API development, database design, responsive frontend development, pricing logic, email integration, and administrative management.

The system separates customer-facing functionality from administrative operations while maintaining a scalable backend architecture suitable for production environments.

---

# :) Key Features

## Customer Features

* Premium vehicle browsing
* Instant booking experience
* Dynamic fare estimation
* Airport transfer booking
* Hourly chauffeur services
* Reservation management
* Responsive mobile interface
* Contact & support system
* Secure authentication
* Profile management

---

## Admin Features

* Secure administrator login
* Dashboard analytics
* Booking management
* Vehicle management
* Driver management
* Customer management
* Pricing configuration
* Theme customization
* Email management
* Database seeding utilities

---

## Booking System

* One-way rides
* Round-trip bookings
* Hourly reservations
* Airport transfers
* Date & time scheduling
* Passenger information
* Vehicle selection
* Booking confirmation

---

## Booking Workflow

```mermaid
flowchart TD

Start([Customer])

Start --> Pickup["📍 Select Pickup"]

Pickup --> Destination["📍 Select Destination"]

Destination --> Date["📅 Choose Date & Time"]

Date --> Vehicle["🚘 Select Vehicle"]

Vehicle --> Pricing["💰 Dynamic Pricing Engine"]

Pricing --> Review["📄 Review Booking"]

Review --> Login{"Logged In?"}

Login -- No --> Register["🔐 Login / Register"]

Login -- Yes --> Payment["✅ Confirm Booking"]

Register --> Payment

Payment --> Database["🍃 Store Booking"]

Database --> Email["📧 Confirmation Email"]

Email --> Success([Booking Successful])

```
## Dynamic Pricing Engine

The pricing engine calculates fares based on multiple business rules instead of fixed values.

Pricing considers:

* Vehicle category
* Ride type
* Distance
* Hourly bookings
* Chauffeur services
* Configurable pricing maps
* Administrative pricing rules

This architecture allows business administrators to update prices without modifying application code.

---
##  Dynamic Pricing Engine

```mermaid
flowchart TD

Start([Ride Request])

Start --> Vehicle["🚘 Vehicle Type"]

Vehicle --> Ride["🚖 Ride Category"]

Ride --> Distance["📍 Distance"]

Distance --> Duration["⏱ Duration"]

Duration --> PricingMap["📊 Price Map"]

PricingMap --> Condition{"Special Conditions?"}

Condition -- Airport --> AirportFee["Airport Pricing"]

Condition -- Hourly --> Hourly["Hourly Rate"]

Condition -- Standard --> Standard["Distance Rate"]

AirportFee --> Total

Hourly --> Total

Standard --> Total

Total["💰 Final Fare"]

Total --> Booking["Booking Summary"]

```
## Authentication

* JWT Authentication
* Password hashing
* Protected routes
* Admin authorization
* User sessions
* Secure API access

---
## Authentication Flow

```mermaid
sequenceDiagram

Customer->>Frontend: Login

Frontend->>Backend: POST /login

Backend->>MongoDB: Verify User

MongoDB-->>Backend: User Found

Backend->>Backend: Verify Password

Backend-->>Frontend: JWT Token

Frontend->>Frontend: Store Token

Frontend->>Backend: Authenticated Request

Backend->>Backend: Verify JWT

Backend-->>Frontend: Protected Resource

```
## Email Services

Integrated email functionality provides:

* Booking confirmations
* Customer inquiries
* Contact form notifications
* Administrative alerts

---
## Email Notification Service

```mermaid
flowchart LR

Booking["Booking Confirmed"]

Booking --> API["Express API"]

API --> Email["Email Service"]

Email --> SMTP["SMTP"]

SMTP --> Customer["Customer"]

SMTP --> Admin["Administrator"]

```
# Screenshots

# Booking Page
![Booking Page](images/bookingPAge.png)

---
# Car Lists
![Car List](images/carlists.png)

--
# Confirmation Page
![Confirmation Page](images/confirmationPage.png)

--
# :) Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Axios
* React Icons

---

## Backend

* Node.js
* Express.js
* JWT
* bcrypt
* Nodemailer
* REST APIs

---

## Database

* MongoDB
* Mongoose ODM

---
## Database Design

```mermaid
erDiagram

    USERS ||--o{ BOOKINGS : places
    VEHICLES ||--o{ BOOKINGS : assigned
    DRIVERS ||--o{ BOOKINGS : drives
    PRICEMAPS ||--o{ BOOKINGS : calculates
    THEMES ||--|| USERS : customizes

    USERS {
        string id
        string name
        string email
        string password
        string role
    }

    BOOKINGS {
        string id
        string vehicle
        string pickup
        string destination
        date bookingDate
        float fare
        string status
    }

    VEHICLES {
        string id
        string name
        string category
        int seats
        string image
    }

    DRIVERS {
        string id
        string name
        string phone
        string license
    }

    PRICEMAPS {
        string id
        float baseRate
        float hourlyRate
        float chauffeurRate
    }

    THEMES {
        string id
        string primaryColor
        string logo
    }

```

## Development Tools

* Git
* GitHub
* VS Code
* ESLint
* npm

---

# :) Architecture

```mermaid
flowchart LR

    User([👤 Customer])

    subgraph FE["🌐 Frontend (Next.js + React)"]
        Home["🏠 Home"]
        Fleet["🚘 Fleet"]
        Booking["📅 Booking"]
        Profile["👤 Profile"]
        Contact["📞 Contact"]
        Dashboard["📊 Admin Dashboard"]
    end

    subgraph BE["⚡ Backend (Express.js)"]
        Auth["🔐 JWT Authentication"]
        BookingAPI["📋 Booking Service"]
        Pricing["💰 Pricing Engine"]
        Vehicle["🚗 Vehicle Management"]
        Driver["👨‍✈️ Driver Management"]
        Email["📧 Email Service"]
        Admin["🛠 Admin APIs"]
    end

    subgraph DB["🍃 MongoDB"]
        Users[(Users)]
        Vehicles[(Vehicles)]
        Drivers[(Drivers)]
        Bookings[(Bookings)]
        PriceMaps[(Price Maps)]
        Themes[(Theme Settings)]
    end

    SMTP["📨 SMTP Server"]

    User --> FE
    FE --> BE

    BE --> Users
    BE --> Vehicles
    BE --> Drivers
    BE --> Bookings
    BE --> PriceMaps
    BE --> Themes

    Email --> SMTP
```

# :) Project Structure

```text
DriveElite
│
├── components/
├── pages/
├── public/
├── styles/
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── seed.js
│
├── docs/
├── .env.example
├── package.json
└── README.md
```

---

# :) High-Level Workflow

```text
Customer

      │

      ▼

Select Ride

      │

      ▼

Choose Vehicle

      │

      ▼

Pricing Engine

      │

      ▼

Booking Confirmation

      │

      ▼

Database Storage

      │

      ▼

Confirmation Email

      │

      ▼

Admin Dashboard
```

## Future Improvements

- Real-time vehicle tracking
- AI-powered vehicle recommendations
- Razorpay/Stripe payment integration
- Email and SMS booking notifications
- Admin analytics dashboard
- Docker deployment
- Cloud deployment on AWS
