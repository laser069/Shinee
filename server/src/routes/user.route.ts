import express from "express";
import { register, login, getProfile } from "../controllers/user.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { UserRegistrationSchema, UserLoginSchema } from "../schemas/user.schema.js";

const router = express.Router();

// 1. Authentication Routes
// Public: Anyone can register or login
router.post("/register", validate(UserRegistrationSchema), register);
router.post("/login", validate(UserLoginSchema), login);

// 2. User Routes
// Private: Must have a valid JWT
router.get("/profile", protect, getProfile);

// 3. Admin Routes
// Private: Must be logged in AND be an admin
router.get("/admin-panel", protect, admin, (req, res) => {
  res.json({ message: "Welcome to the Secret Admin Dashboard" });
});

export default router;