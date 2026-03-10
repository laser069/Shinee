# Server - Shinee Task Management API

A robust RESTful API backend built with Express.js, MongoDB, and TypeScript for a task management application.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Features](#features)
- [Security](#security)
- [License](#license)

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Express.js](https://expressjs.com/) | ^5.2.1 | Web Framework |
| [MongoDB](https://www.mongodb.com/) | - | Database |
| [Mongoose](https://mongoosejs.com/) | ^9.2.4 | ODM |
| [TypeScript](https://www.typescriptlang.org/) | ^5.9.3 | Language |
| [Zod](https://zod.dev/) | ^4.3.6 | Validation |
| [JWT](https://jwt.io/) | ^9.0.3 | Authentication |
| [Bcrypt](https://www.npmjs.com/package/bcrypt) | ^6.0.0 | Password Hashing |
| [Helmet](https://helmetjs.github.io/) | ^8.1.0 | Security Headers |
| [CORS](https://www.npmjs.com/package/cors) | ^2.8.6 | Cross-Origin Resource Sharing |
| [Compression](https://www.npmjs.com/package/compression) | ^1.8.1 | Response Compression |

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── db.ts           # MongoDB connection
│   │   └── env.ts         # Environment validation
│   ├── controllers/
│   │   ├── user.controller.ts    # User logic
│   │   ├── board.controller.ts   # Board logic
│   │   └── task.controller.ts    # Task logic
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT authentication
│   │   └── validate.middleware.ts # Zod validation
│   ├── models/
│   │   ├── User.ts        # User Mongoose model
│   │   ├── Board.ts       # Board Mongoose model
│   │   └── Task.ts        # Task Mongoose model
│   ├── routes/
│   │   ├── user.route.ts  # User routes
│   │   ├── board.route.ts # Board routes
│   │   └── task.route.ts # Task routes (empty)
│   ├── schemas/
│   │   ├── user.schema.ts  # Zod validation schemas
│   │   ├── board.schema.ts # Zod validation schemas
│   │   └── task.schema.ts # Zod validation schemas
│   ├── services/
│   │   ├── user.service.ts  # User business logic
│   │   ├── board.service.ts # Board business logic
│   │   └── task.service.ts  # Task business logic
│   ├── types/
│   │   └── express.d.ts    # TypeScript declarations
│   └── server.ts          # Entry point
├── .env                   # Environment variables
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── pnpm-lock.yaml        # Lock file
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- pnpm (recommended) or npm/yarn

## Installation

```bash
# Navigate to server directory
cd server

# Install dependencies
pnpm install
# or
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Required
MONGO_URI=mongodb://127.0.0.1:27017/shinee
JWT_SECRET=your-super-secret-jwt-key

# Optional (defaults to 5000)
PORT=5000
```

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `PORT` | Server port number | `5000` |

## Running the Server

```bash
# Development (with hot reload)
pnpm dev

# Production (build first)
pnpm build
pnpm start
```

The server will start at `http://localhost:5000`

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Health Check
```
GET /ping
```

---

## User Endpoints

### Register User
```
POST /users/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (201):**
```json
{
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "createdAt": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login User
```
POST /users/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Get Profile
```
GET /users/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false,
  "createdAt": "..."
}
```

---

## Board Endpoints

### Create Board
```
POST /users/boards
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "My Project Board"
}
```

**Response (201):**
```json
{
  "_id": "...",
  "title": "My Project Board",
  "user": "...",
  "tasks": [],
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Get All Boards
```
GET /users/boards
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "...",
    "title": "My Project Board",
    "user": "...",
    "tasks": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### Get Board Details
```
GET /users/boards/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "...",
  "title": "My Project Board",
  "user": "...",
  "tasks": [
    {
      "_id": "...",
      "title": "Task 1",
      "description": "Description",
      "status": "todo"
    }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Update Board
```
PATCH /users/boards/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Board Title"
}
```

**Response (200):**
```json
{
  "_id": "...",
  "title": "Updated Board Title",
  "user": "...",
  "tasks": [],
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Delete Board
```
DELETE /users/boards/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Board deleted successfully"
}
```

---

## Task Endpoints

### Create Task
```
POST /users/tasks
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "boardId": "board-id-here"
}
```

**Response (201):**
```json
{
  "_id": "...",
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "user": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Get User Tasks
```
GET /users/tasks
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "_id": "...",
    "title": "New Task",
    "description": "Task description",
    "status": "todo",
    "user": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### Update Task
```
PATCH /users/tasks/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "inprogress"
}
```

**Response (200):**
```json
{
  "_id": "...",
  "title": "New Task",
  "description": "Task description",
  "status": "inprogress",
  "user": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Delete Task
```
DELETE /users/tasks/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

---

## Features

### Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes with middleware

### Data Validation
- Zod schema validation
- Input sanitization
- Error handling

### Security
- Helmet for HTTP security headers
- CORS configuration
- Environment variable validation

### Database
- MongoDB with Mongoose ODM
- Timestamp tracking
- Relational linking between User, Board, and Task

## Error Responses

All endpoints return appropriate HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

**Error Response Format:**
```json
{
  "message": "Error description"
}
```

**Validation Error Response:**
```json
{
  "message": "Validation error message"
}
```

## License

ISC License
