import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import boardService from '../services/board.service';

export const createBoard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const board = await boardService.createBoard(req.user.id, req.body);
    res.status(201).json(board);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBoards = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const boards = await boardService.getAllBoards(req.user.id);
    res.json(boards);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBoardDetails = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const boardId = req.params.id as string;
    const board = await boardService.getBoardById(boardId, req.user.id);
    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json(board);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBoard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const boardId = req.params.id as string;
    const board = await boardService.deleteBoard(boardId, req.user.id);
    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json({ message: "Board deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBoard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const id = req.params.id as string;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const board = await boardService.updateBoardTitle(id, req.user.id, title);

    if (!board) {
      return res.status(404).json({ message: "Board not found or unauthorized" });
    }

    res.json(board);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};