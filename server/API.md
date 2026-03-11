# API Documentation

Complete technical documentation for the Shinee Task Management API.

---

## Table of Contents

- [Overview](#overview)
- [Base Configuration](#base-configuration)
- [Authentication](#authentication)
- [User Endpoints](#user-endpoints)
- [Board Endpoints](#board-endpoints)
- [Task Endpoints](#task-endpoints)
- [Habit Endpoints](#habit-endpoints)
- [Data Models](#data-models)
- [Validation Schemas](#validation-schemas)
- [Middleware](#middleware)
- [Error Handling](#error-handling)

---

## Overview

This API provides a complete task management system with user authentication, board management, and task tracking capabilities.

### Base URL
```
http://localhost:5000
```

### Content Types
- Request: `application/json`
- Response: `application/json`

---

## Base Configuration

### Server Entry Point
[`src/server.ts`](src/server.ts)
```typescript
import express from 'express';
import 'dotenv/config';
import { env } from './config/env';
import ConnectDB from './config/db';
import userRoutes from './routes/user.route';
import cors from 'cors';

const app = express();
app.use(express.json());

// Enable CORS for frontend (port 3000)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

ConnectDB();

app.get("/ping",(req,res)=>{
    return res.status(200).json({message:'PONG!'});
})
app.use("/api/users",userRoutes);
app.listen(env.PORT,()=>{
    console.log(`Server running at http://localhost:${env.PORT}`);
})
```

### Health Check
Determine if the server is alive.

**Endpoint:** `GET /ping`

**Response (200 OK):**
```json
{
  "message": "PONG!"
}
```

### Environment Configuration
[`src/config/env.ts`](src/config/env.ts)
```typescript
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  JWT_SECRET: z.string().min(1, "JWT_SECRET is missing from .env"),
  PORT: z.string().default("5000"),
  MONGO_URI: z.string(),
});

export const env: z.infer<typeof envSchema> = envSchema.parse(process.env);
```

### Database Connection
[`src/config/db.ts`](src/config/db.ts)
```typescript
import mongoose from 'mongoose';
import {env} from './env';

const ConnectDB = async ()=>{
    try {
        const conn = await mongoose.connect(env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default ConnectDB;
```

---

## Authentication

### JWT Implementation
The API uses JSON Web Tokens (JWT) for stateless authentication.

**Token Payload:**
```typescript
interface TokenPayload {
  id: string;
  isAdmin: boolean;
}
```

**Token Options:**
- Algorithm: HS256
- Expiration: 30 days

### Protected Routes
All board and task endpoints require authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

---

## User Endpoints

### Register User
Creates a new user account with hashed password.

**Endpoint:** `POST /api/users/register`

**Validation Schema:**
```typescript
// From src/schemas/user.schema.ts
const UserRegistrationSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email().trim().lowercase(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  isAdmin: z.boolean().default(false).optional(),
});
```

**Request:**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Response (201 Created):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 400: Validation error (ZodError)
- 400: "User already exists"

---

### Login User
Authenticates user and returns JWT token.

**Endpoint:** `POST /api/users/login`

**Request:**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 401: "Invalid email or password"

---

### Get Profile
Retrieves the authenticated user's profile.

**Endpoint:** `GET /api/users/profile`

**Headers:**
```http
Authorization: Bearer <token>
```

**Request:**
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- 401: "Not authorized"
- 404: "User not found"

---

### Admin Panel
Access restricted administrative content.

**Endpoint:** `GET /api/users/admin-panel`

**Headers:**
```http
Authorization: Bearer <admin-token>
```

**Response (200 OK):**
```json
{
  "message": "Welcome to the Secret Admin Dashboard"
}
```

---

## Board Endpoints

### Create Board
Creates a new board for the authenticated user.

**Endpoint:** `POST /api/boards`

**Headers:**
```http
Authorization: Bearer <token>
```

**Validation Schema:**
```typescript
// From src/schemas/board.schema.ts
const CreateBoardSchema = z.object({
  title: z.string().min(1).max(50),
  user: z.string(), // The owner of the board
});
```

**Request:**
```bash
curl -X POST http://localhost:5000/api/boards \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Project Board"
  }'
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "My Project Board",
  "user": "507f1f77bcf86cd799439011",
  "tasks": [],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Get All Boards
Retrieves all boards owned by the authenticated user.

**Endpoint:** `GET /api/boards`

**Headers:**
```http
Authorization: Bearer <token>
```

**Request:**
```bash
curl -X GET http://localhost:5000/api/boards \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "My Project Board",
    "user": "507f1f77bcf86cd799439011",
    "tasks": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Task 1",
        "description": "Description",
        "status": "todo"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Get Board Details
Retrieves a specific board by ID with populated tasks.

**Endpoint:** `GET /api/boards/:id`

**Headers:**
```http
Authorization: Bearer <token>
```

**Request:**
```bash
curl -X GET http://localhost:5000/api/boards/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "My Project Board",
  "user": "507f1f77bcf86cd799439011",
  "tasks": [],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- 404: "Board not found"

---

### Update Board
Updates the board title.

**Endpoint:** `PATCH /api/boards/:id`

**Headers:**
```http
Authorization: Bearer <token>
```

**Validation Schema:**
```typescript
const UpdateBoardSchema = z.object({
  body: z.object({
    title: z.string().min(1).min(3).max(50).trim(),
  }),
});
```

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/boards/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Board Title"
  }'
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Updated Board Title",
  "user": "507f1f77bcf86cd799439011",
  "tasks": [],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Error Responses:**
- 400: "Title is required"
- 404: "Board not found or unauthorized"

---

### Delete Board
Deletes a board by ID.

**Endpoint:** `DELETE /api/boards/:id`

**Headers:**
```http
Authorization: Bearer <token>
```

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/boards/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "message": "Board deleted successfully"
}
```

**Error Responses:**
- 404: "Board not found"

---

## Task Endpoints

### Create Task
Creates a new task and adds it to a board.

**Endpoint:** `POST /api/tasks`

**Headers:**
```http
Authorization: Bearer <token>
```

**Validation Schema:**
```typescript
// From src/schemas/task.schema.ts
const CreateTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  status: z.enum(['todo', 'inprogress', 'done']).default('todo'),
  user: z.string(),
});
```

**Request:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Task",
    "description": "Task description",
    "status": "todo",
    "boardId": "507f1f77bcf86cd799439012"
  }'
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "user": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Get User Tasks
Retrieves all tasks for the authenticated user.

**Endpoint:** `GET /api/tasks`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `boardId` | string | (Optional) Filter tasks by a specific board ID |

**Headers:**
```http
Authorization: Bearer <token>
```

**Request:**
```bash
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "title": "New Task",
    "description": "Task description",
    "status": "todo",
    "user": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Update Task
Updates a task's properties.

**Endpoint:** `PATCH /api/tasks/:id`

**Headers:**
```http
Authorization: Bearer <token>
```

**Request:**
```bash
curl -X PATCH http://localhost:5000/api/tasks/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inprogress",
    "title": "Updated Title"
  }'
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "Updated Title",
  "description": "Task description",
  "status": "inprogress",
  "user": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Error Responses:**
- 404: "Task not found"

---

### Delete Task
Deletes a task by ID.

**Endpoint:** `DELETE /api/tasks/:id`

**Headers:**
```http
Authorization: Bearer <token>
```

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/tasks/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200 OK):**
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses:**
- 404: "Task not found"

---

## Habit Endpoints

### Get Habit Dashboard
Retrieves all habits with current progress for the authenticated user.

**Endpoint:** `GET /api/habits`

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5f1f77bcf86cd799439014",
      "name": "Drink Water",
      "category": "Health",
      "goal": {
        "scheduledDays": [1, 2, 3, 4, 5]
      },
      "grid": [
        {
          "date": "2024-01-15T00:00:00Z",
          "isCompleted": true,
          "isScheduled": true
        }
      ],
      "weeklyProgress": 80
    }
  ]
}
```

---

### Create Habit
Creates a new habit definition.

**Endpoint:** `POST /api/habits`

**Validation Schema:** `HabitValidationSchema`

**Request:**
```json
{
  "name": "Read Books",
  "category": "Growth",
  "trackingType": "numeric",
  "goal": {
    "targetValue": 20,
    "unit": "pages",
    "frequency": "daily"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "60d5f1f77bcf86cd799439015",
    "name": "Read Books",
    "category": "Growth",
    "trackingType": "numeric",
    "goal": {
      "targetValue": 20,
      "unit": "pages",
      "frequency": "daily"
    }
  }
}
```

---

### Toggle Habit Day
Logs or un-logs progress for a specific day.

**Endpoint:** `POST /api/habits/toggle`

**Request:**
```json
{
  "habitId": "60d5f1f77bcf86cd799439015",
  "date": "2024-01-15T10:30:00Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "checked"
  }
}
```

---

### Delete Habit
Deletes a habit and all associated logs.

**Endpoint:** `DELETE /api/habits/:id`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Habit deleted"
}
```

---

## Data Models

### User Model
[`src/models/User.ts`](src/models/User.ts)
```typescript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
```

### Board Model
[`src/models/Board.ts`](src/models/Board.ts)
```typescript
import mongoose from 'mongoose';

const BoardSchema = new mongoose.Schema({
    tasks:[{type:mongoose.Schema.Types.ObjectId,ref:'Task'}],
    title:{type:String,required:true},
    user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
})

export default mongoose.model('Board',BoardSchema);
```

### Task Model
[`src/models/Task.ts`](src/models/Task.ts)
```typescript
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    status:{type:String,enum:['todo','inprogress','done'],default:'todo'},
    user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
})

export default mongoose.model('Task',taskSchema);
```

### Habit Model
[`src/models/Habit.ts`](src/models/Habit.ts)
```typescript
const HabitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Health', 'Growth', 'Quit', 'Social', 'Milestone'], 
    required: true 
  },
  trackingType: {
    type: String,
    enum: ['numeric', 'binary', 'countdown'],
    required: true
  },
  goal: {
    targetValue: { type: Number, default: 1 }, 
    unit: { type: String },
    frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' }
  },
  gamification: {
    basePoints: { type: Number, default: 10 },
    currentStreak: { type: Number, default: 0 },
    highestStreak: { type: Number, default: 0 },
    lastRelapseDate: { type: Date, default: Date.now }
  }
}, { timestamps: true });
```

### Log Model
```typescript
const LogSchema = new mongoose.Schema({
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: () => new Date().setHours(0,0,0,0) },
  value: { type: Number, required: true },
  pointsEarned: { type: Number, default: 0 },
  multiplierAtTime: { type: Number, default: 1 }
}, { timestamps: true });
```

---

## Validation Schemas

All validation uses Zod for schema validation. The schemas provide both runtime validation and TypeScript type inference.

### User Validation
[`src/schemas/user.schema.ts`](src/schemas/user.schema.ts)
```typescript
export const UserRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email format").trim().lowercase(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  isAdmin: z.boolean().default(false).optional(),
});

export const UserLoginSchema = UserRegistrationSchema.pick({
  email: true,
  password: true,
});

export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
```

### Board Validation
[`src/schemas/board.schema.ts`](src/schemas/board.schema.ts)
```typescript
export const BoardSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1).max(50),
  tasks: z.array(z.string()).default([]),
  user: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateBoardSchema = BoardSchema.omit({ 
  _id: true, 
  tasks: true, 
  createdAt: true, 
  updatedAt: true 
});

export const UpdateBoardSchema = z.object({
  body: z.object({
    title: z.string().min(1).min(3).max(50).trim(),
  }),
});

export type Board = z.infer<typeof BoardSchema>;
export type CreateBoardPayload = z.infer<typeof CreateBoardSchema>;
```

### Task Validation
[`src/schemas/task.schema.ts`](src/schemas/task.schema.ts)
```typescript
export const TaskStatusEnum = z.enum(['todo', 'inprogress', 'done']);

export const TaskSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  status: TaskStatusEnum.default('todo'),
  user: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateTaskSchema = TaskSchema.omit({ 
  _id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskPayload = z.infer<typeof CreateTaskSchema>;
```

### Habit Validation
[`src/schemas/habit.schema.ts`](src/schemas/habit.schema.ts)
```typescript
export const HabitValidationSchema = z.object({
  name: z.string().min(2).max(50),
  category: z.enum(['Health', 'Growth', 'Quit', 'Social', 'Milestone']),
  trackingType: z.enum(['numeric', 'binary', 'countdown']),
  goal: z.object({
    targetValue: z.number().positive().default(1),
    unit: z.string().optional(),
    frequency: z.enum(['daily', 'weekly']).default('daily'),
  }),
  gamification: z.object({
    basePoints: z.number().min(0).default(10),
  }).optional(),
});

export const LogValidationSchema = z.object({
  habitId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  value: z.number().min(0),
  date: z.string().datetime().optional(),
  note: z.string().max(200).optional(),
});
```

---

## Middleware

### Authentication Middleware
[`src/middleware/auth.middleware.ts`](src/middleware/auth.middleware.ts)
```typescript
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthRequest extends Request {
  user?: { id: string; isAdmin: boolean };
}

interface TokenPayload {
  id: string;
  isAdmin: boolean;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token!, env.JWT_SECRET as string) as unknown as TokenPayload;
      req.user = { id: decoded.id, isAdmin: decoded.isAdmin };
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};
```

### Validation Middleware
[`src/middleware/validate.middleware.ts`](src/middleware/validate.middleware.ts)
```typescript
import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export const validate = (schema: ZodTypeAny) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({ errors: error.errors });
    }
  };
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource successfully created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

### Error Response Formats

**Validation Error:**
```json
{
  "message": "Validation error message"
}
```

**Generic Error:**
```json
{
  "message": "Error description"
}
```

---

## Routes Configuration

### User Routes
[`src/routes/user.route.ts`](src/routes/user.route.ts)
```typescript
import express from "express";
import { register, login, getProfile } from "../controllers/user.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { UserRegistrationSchema, UserLoginSchema } from "../schemas/user.schema.js";

const router = express.Router();

router.post("/register", validate(UserRegistrationSchema), register);
router.post("/login", validate(UserLoginSchema), login);
router.get("/profile", protect, getProfile);
router.get("/admin-panel", protect, admin, (req, res) => {
  res.json({ message: "Welcome to the Secret Admin Dashboard" });
});

export default router;
```

### Board Routes
[`src/routes/board.route.ts`](src/routes/board.route.ts)
```typescript
import { Router } from "express";
import { 
  createBoard, 
  getBoards, 
  getBoardDetails, 
  deleteBoard, 
  updateBoard
} from "../controllers/board.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { UpdateBoardSchema } from "../schemas/board.schema.js";

const router = Router();
router.use(protect);

router.route("/")
  .get(getBoards)
  .post(createBoard);

router.route("/:id")
  .get(getBoardDetails)
  .delete(deleteBoard)
  .patch(validate(UpdateBoardSchema), updateBoard);

export default router;
```

### Habit Routes
[`src/routes/habit.routes.ts`](src/routes/habit.routes.ts)
```typescript
import { Router } from "express";
import * as ctrl from "../controllers/habit.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { HabitValidationSchema } from "../schemas/habit.schema.js";

const router = Router();
router.use(protect);

router.route("/")
  .get(ctrl.getDashboard)
  .post(validate(HabitValidationSchema), ctrl.createHabit);

router.route("/toggle")
  .post(ctrl.toggleDay);

router.route("/:id")
  .patch(ctrl.updateHabit)
  .delete(ctrl.deleteHabit);

export default router;
```

---

## Services

### User Service
[`src/services/user.service.ts`](src/services/user.service.ts)
```typescript
class UserService {
  async createUser(userData: UserRegistration) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = new User({
      ...userData,
      password: hashedPassword,
    });

    return await user.save();
  }

  async findUserByEmail(email: string) {
    return await User.findOne({ email });
  }

  async findUserById(id: string) {
    return await User.findById(id).select("-password");
  }
}

export default new UserService();
```

### Board Service
[`src/services/board.service.ts`](src/services/board.service.ts)
```typescript
class BoardService {
  async createBoard(userId: string, data: CreateBoardPayload) {
    return await Board.create({
      ...data,
      user: userId,
      tasks: []
    });
  }

  async getAllBoards(userId: string) {
    return await Board.find({ user: userId })
      .populate('tasks')
      .sort({ createdAt: -1 });
  }

  async getBoardById(boardId: string, userId: string) {
    return await Board.findOne({ _id: boardId, user: userId }).populate('tasks');
  }

  async deleteBoard(boardId: string, userId: string) {
    return await Board.findOneAndDelete({ _id: boardId, user: userId });
  }

  async updateBoardTitle(boardId: string, userId: string, newTitle: string) {
    return await Board.findOneAndUpdate(
      { _id: boardId, user: userId },
      { $set: { title: newTitle } },
      { new: true, runValidators: true }
    );
  }
}

export default new BoardService();
```

### Task Service
[`src/services/task.service.ts`](src/services/task.service.ts)
```typescript
class TaskService {
  async createTask(userId: string, boardId: string, data: CreateTaskPayload) {
    const task = await Task.create({
      ...data,
      user: userId,
    });

    await Board.findByIdAndUpdate(boardId, {
      $push: { tasks: task._id }
    });

    return task;
  }

  async getTasksByUser(userId: string) {
    return await Task.find({ user: userId }).sort({ createdAt: -1 });
  }

  async updateTask(taskId: string, userId: string, updateData: Partial<CreateTaskPayload>) {
    return await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
  }

  async deleteTask(taskId: string, userId: string) {
    const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
    if (task) {
      await Board.updateMany({}, { $pull: { tasks: taskId } });
    }
    return task;
  }
}

export default new TaskService();
```

### Habit Service
[`src/services/habit.service.ts`](src/services/habit.service.ts)
```typescript
class HabitService {
  async createHabit(userId: string, data: any) {
    return await Habit.create({ ...data, userId });
  }

  async getWeeklySheet(userId: string) {
    // Generates the Weekly Table Data and progress
  }

  async toggleDay(userId: string, habitId: string, date: string) {
    // Toggles a log for the specific day
  }

  async deleteHabit(userId: string, habitId: string) {
    // Deletes habit and associated logs
  }
}
```

---

## Testing with cURL Examples

### Complete User Flow

```bash
# 1. Register a new user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123"}'

# 2. Login with the user
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123"}'

# 3. Get user profile (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer TOKEN"

# 4. Create a board (replace TOKEN with actual token)
curl -X POST http://localhost:5000/api/boards \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Board"}'

# 5. Get all boards (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/boards \
  -H "Authorization: Bearer TOKEN"

# 6. Create a task in the board (replace TOKEN and BOARD_ID)
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Task 1","description":"Do something","status":"todo","boardId":"BOARD_ID"}'
```

---

## Security Features

1. **Password Hashing** - Bcrypt with salt rounds
2. **JWT Authentication** - Stateless token-based auth
3. **Helmet** - HTTP security headers
4. **CORS** - Cross-origin resource sharing
5. **Input Validation** - Zod schema validation
6. **Environment Variables** - Secure configuration management
