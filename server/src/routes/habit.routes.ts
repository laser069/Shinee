import { Router } from "express";
import { 
  createHabit, 
  getDashboard, 
  logActivity, 
  handleRelapse,
  getQuitStats 
} from "../controllers/habit.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { HabitValidationSchema, LogValidationSchema } from "../schemas/habit.schema.js";

const router = Router();

// --- PROTECT ALL ROUTES ---
// Every habit action requires a valid JWT token
router.use(protect);

// --- DASHBOARD & CREATION ---
// Base path: /api/habits/
router.route("/")
  .get(getDashboard) // Get all habits with progress checkmarks
  .post(validate(HabitValidationSchema), createHabit); // Create a new habit definition

// --- LOGGING & PROGRESS ---
// Path: /api/habits/log
router.route("/log")
  .post(validate(LogValidationSchema), logActivity); // Add daily/weekly steps/pages/tasks

// --- QUIT/SOBRIETY SPECIFIC ---
// Path: /api/habits/:id/relapse
router.route("/:id/relapse")
  .patch(handleRelapse); // Reset streak to 0 (Instagram relapse)

// Path: /api/habits/:id/stats
router.route("/:id/stats")
  .get(getQuitStats); // Get "Days Since" counter for sobriety habits

export default router;