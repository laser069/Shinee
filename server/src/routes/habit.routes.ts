import { Router } from "express";
import * as ctrl from "../controllers/habit.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { HabitValidationSchema } from "../schemas/habit.schema.js";

const router = Router();

// All habit routes require a logged-in user
router.use(protect);

/**
 * DASHBOARD & CREATION
 * GET  /api/habits/dashboard -> Returns the Notion-style 7-day grid
 * POST /api/habits           -> Creates the habit template
 */
router.get("/dashboard", ctrl.getDashboard);
router.post("/", validate(HabitValidationSchema), ctrl.createHabit);

/**
 * INTERACTIVITY (The "Checkboxes")
 * POST /api/habits/toggle -> Handles checking/unchecking and numeric logs
 */
router.post("/toggle", ctrl.toggleActivity);

/**
 * INDIVIDUAL HABIT MANAGEMENT
 * PATCH  /api/habits/:id         -> Edit name, icons, schedule, or goals
 * PATCH  /api/habits/:id/archive -> Hide habit from the main dashboard
 * DELETE /api/habits/:id         -> Full removal of habit and its logs
 */
router.route("/:id")
  .patch(ctrl.updateHabit)
  .delete(ctrl.deleteHabit);

router.patch("/:id/archive", ctrl.archiveHabit);

export default router;