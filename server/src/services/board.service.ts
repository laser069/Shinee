import Board from '../models/Board';
import { CreateBoardPayload } from '../schemas/board.schema';

class BoardService {
  async createBoard(userId: string, data: CreateBoardPayload) {
    return await Board.create({
      ...data,
      user: userId,
      tasks: []
    });
  }

  async getAllBoards(userId: string) {
    return await Board.find({ user: userId })
      .populate('tasks') // Populates the task array with actual task documents
      .sort({ createdAt: -1 });
  }

  async getBoardById(boardId: string, userId: string) {
    return await Board.findOne({ _id: boardId, user: userId }).populate({
      path: 'tasks',
      options: { sort: { createdAt: -1 } }
    });
  }

  async deleteBoard(boardId: string, userId: string) {
    return await Board.findOneAndDelete({ _id: boardId, user: userId });
  }

async updateBoardTitle(boardId: string, userId: string, newTitle: string) {
  const updatedBoard = await Board.findOneAndUpdate(
    { _id: boardId, user: userId }, // Security: Must own the board
    { $set: { title: newTitle } },  // Only update the title field
    { new: true, runValidators: true } // Return the updated doc
  );
  return updatedBoard;
}
}

export default new BoardService();