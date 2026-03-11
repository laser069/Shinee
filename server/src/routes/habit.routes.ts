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

router.route("/toggle").post(ctrl.toggleDay);

router.route("/:id")
  .patch(ctrl.updateHabit)
  .delete(ctrl.deleteHabit);

export default router;