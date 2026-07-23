import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import notificationService from '../services/notification.service';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const hoursParam = parseInt(req.query.withinHours as string, 10);
    const withinHours = Number.isFinite(hoursParam) && hoursParam > 0 ? Math.min(hoursParam, 168) : 24;

    const notifications = await notificationService.getUpcoming(userId, withinHours);
    res.status(200).json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
