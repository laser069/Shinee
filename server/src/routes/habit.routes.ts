import { Router } from "express";
import { 
  getDashboard, 
  toggleActivity, 
  createHabit, 
  updateHabit, 
  archiveHabit, 
  deleteHabit 
} from "../controllers/habit.controller";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { 
  CreateHabitSchema, 
  UpdateHabitSchema 
} from "../schemas/habit.schema";

const router = Router();

// All habit routes require authentication
router.use(protect);

/**
 * Main Habit Management
 */
router.route("/")
  .get(getDashboard) // Fetches the 7-day grid for all habits
  .post(validate(CreateHabitSchema), createHabit);

/**
 * Checkbox Toggle Action
 * We use POST here as it involves complex streak/log logic 
 * and requires the date/value in the body.
 */
router.post("/toggle", toggleActivity);

/**
 * Specific Habit Operations
 */
router.route("/:id")
  .patch(validate(UpdateHabitSchema), updateHabit) // Edit settings
  .delete(deleteHabit); // Permanent deletion

/**
 * Archiving
 * Separated to keep the DELETE method reserved for permanent removal
 */
router.patch("/:id/archive", archiveHabit);

export default router;