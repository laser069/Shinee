import { Router } from "express";
import { 
  createBoard, 
  getBoards, 
  getBoardDetails, 
  deleteBoard, 
  updateBoard // Import the new controller
} from "../controllers/board.controller";
import { protect } from "../middleware/auth.middleware";
import {validate} from "../middleware/validate.middleware";
import {UpdateBoardSchema} from "../schemas/board.schema";

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