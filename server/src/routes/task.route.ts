import { Router } from "express";
import {
  createTask,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask
} from "../controllers/task.controller";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { CreateTaskSchema, UpdateTaskPayloadSchema } from "../schemas/task.schema";

const router = Router();

router.use(protect);

router.route("/")
  .get(getMyTasks)
  .post(validate(CreateTaskSchema), createTask);

router.route("/:id")
  .get(getTaskById)
  .patch(validate(UpdateTaskPayloadSchema), updateTask)
  .delete(deleteTask);

export default router;
