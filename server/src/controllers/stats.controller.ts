import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import statsService from '../services/stats.service';

export const getOverview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const weeksParam = parseInt(req.query.weeks as string, 10);
    const weeks = Number.isFinite(weeksParam) && weeksParam > 0 ? Math.min(weeksParam, 26) : 8;

    const overview = await statsService.getOverview(userId, weeks);
    res.status(200).json({ success: true, data: overview });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
