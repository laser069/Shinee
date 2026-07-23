import { Router } from 'express';
import { getNotifications } from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', getNotifications);

export default router;
