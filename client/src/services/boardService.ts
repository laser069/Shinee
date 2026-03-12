import apiClient from '../lib/apiClient';
import type { 
  Board, 
  CreateBoardPayload, 
  UpdateBoardPayload, 
  ApiResponse 
} from '../types';

const boardService = {
  /**
   * Get all boards for the authenticated user
   */
  getBoards: async (): Promise<Board[]> => {
    try {
      const { data } = await apiClient.get<ApiResponse<Board[]>>('/boards');
      // Force return of an array even if backend data is null/undefined
      return Array.isArray(data?.data) ? data.data : [];
    } catch (error) {
      console.error("boardService.getBoards error:", error);
      return []; // Return empty array on failure to prevent UI crash
    }
  },

  getBoardById: async (id: string): Promise<Board | null> => {
    const { data } = await apiClient.get<ApiResponse<Board>>(`/boards/${id}`);
    return data.data || null;
  },

  createBoard: async (payload: CreateBoardPayload): Promise<Board> => {
    const { data } = await apiClient.post<ApiResponse<Board>>('/boards', payload);
    return data.data;
  },

  updateBoard: async (id: string, payload: UpdateBoardPayload): Promise<Board> => {
    const { data } = await apiClient.patch<ApiResponse<Board>>(`/boards/${id}`, payload);
    return data.data;
  },

  deleteBoard: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(`/boards/${id}`);
    return { message: data?.message || 'Board deleted successfully' };
  },
};

export default boardService;