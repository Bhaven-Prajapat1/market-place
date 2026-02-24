# Authentication Service (Marketplace Auth)

A robust, production-ready authentication microservice built with Node.js, Express, and MongoDB. This service handles user registration, login, JWT-based authentication, and user profile management for the marketplace platform.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Development](#development)

## ✨ Features

- **User Authentication**
  - Secure user registration with email validation
  - Login with JWT token generation
  - Secure password hashing using bcrypt
  - Logout functionality with token blacklisting

- **User Profile Management**
  - Get authenticated user profile information
  - Manage multiple addresses per user
  - Add, retrieve, and delete user addresses
  - Address validation and persistence

- **Security**
  - JWT-based token authentication
  - Password encryption with bcrypt
  - Input validation using express-validator
  - Cookie-based token storage
  - Protected routes with middleware

- **Caching & Performance**
  - Redis integration for session management
  - Optimized database queries
  - Token blacklist management

- **Testing**
  - Comprehensive Jest test suite
  - Unit and integration tests
  - MongoDB Memory Server for isolated testing
  - Supertest for API endpoint testing

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis (ioredis)
- **Authentication**: JWT (jsonwebtoken)
- **Password Security**: Bcrypt
- **Validation**: express-validator
- **Testing**: Jest + Supertest
- **Development**: Nodemon

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auth
