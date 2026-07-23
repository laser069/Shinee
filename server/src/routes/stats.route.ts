import { Router } from 'express';
import { getOverview } from '../controllers/stats.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/overview', getOverview);

export default router;
