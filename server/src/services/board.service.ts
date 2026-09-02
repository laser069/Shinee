import Board from '../models/Board';
import Task from '../models/Task';
import { CreateBoardPayload } from '../schemas/board.schema';

class BoardService {
  async createBoard(userId: string, data: CreateBoardPayload) {
    return await Board.create({
      ...data,
      user: userId,
      tasks: []
    });
  }

  /**
   * populate defaults to true so the existing web client is unaffected.
   * Mobile passes false to avoid pulling every task of every board.
   */
  async getAllBoards(userId: string, populate: boolean = true) {
    const query = Board.find({ user: userId }).sort({ createdAt: -1 });
    if (populate) {
      query.populate('tasks'); // Populates the task array with actual task documents
    }
    return await query;
  }

  async getBoardById(boardId: string, userId: string) {
    return await Board.findOne({ _id: boardId, user: userId }).populate({
      path: 'tasks',
      options: { sort: { createdAt: -1 } }
    });
  }

  async deleteBoard(boardId: string, userId: string) {
    const board = await Board.findOneAndDelete({ _id: boardId, user: userId });
    // Deleting the board used to leave its tasks behind as orphans.
    if (board) {
      await Task.deleteMany({ boardId: board._id });
    }
    return board;
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