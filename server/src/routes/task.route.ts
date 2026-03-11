import { Router } from "express";
import { 
  createTask, 
  getMyTasks, 
  updateTask, 
  deleteTask 
} from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.route("/")
  .get(getMyTasks)
  .post(createTask);

router.route("/:id")
  .patch(updateTask)
  .delete(deleteTask);

export default router;
