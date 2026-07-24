import { Router } from "express";
import { exportData, importData } from "../controllers/data.controller";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { ImportSchema } from "../schemas/data.schema";

const router = Router();

router.use(protect);

router.get("/export", exportData);
router.post("/import", validate(ImportSchema), importData);

export default router;
