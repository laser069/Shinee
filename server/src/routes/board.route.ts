import { Router } from "express";
import { 
  createBoard, 
  getBoards, 
  getBoardDetails, 
  deleteBoard, 
  updateBoard // Import the new controller
} from "../controllers/board.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {validate} from "../middleware/validate.middleware.js";
import {UpdateBoardSchema} from "../schemas/board.schema.js";

const router = Router();

router.use(protect);

router.route("/")
  .get(getBoards)
  .post(createBoard); // You likely have a CreateBoardSchema here too

router.route("/:id")
  .get(getBoardDetails)
  .delete(deleteBoard)
  // Validation added here:
  .patch(validate(UpdateBoardSchema), updateBoard);

export default router;