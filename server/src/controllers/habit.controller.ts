import { Response } from "express";
import { HabitService } from "../services/habit.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { Habit } from "../models/Habit";
const habitService = new HabitService();

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const data = await habitService.getWeeklySheet(req.user!.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createHabit = async (req: AuthRequest, res: Response) => {
  try {
    const habit = await Habit.create({ userId: req.user!.id, ...req.body });
    res.status(201).json({ success: true, data: habit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const toggleDay = async (req: AuthRequest, res: Response) => {
  try {
    const { habitId, date } = req.body;
    const result = await habitService.toggleDay(req.user!.id, habitId, date);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateHabit = async (req: AuthRequest, res: Response) => {
  try {
    const habit = await habitService.updateHabit(req.user!.id, req.params.id as string , req.body);
    res.json({ success: true, data: habit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteHabit = async (req: AuthRequest, res: Response) => {
  try {
    await habitService.deleteHabit(req.user!.id, req.params.id as string );
    res.json({ success: true, message: "Habit deleted" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};