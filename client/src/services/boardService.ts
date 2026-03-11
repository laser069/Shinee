import apiClient, { type Board } from '../lib/apiClient';

// Types for request payloads
export interface CreateBoardPayload {
  title: string;
}

export interface UpdateBoardPayload {
  title: string;
}

// API endpoints
const BOARD_ENDPOINTS = {
  BOARDS: '/boards',
  BOARD_DETAILS: (id: string) => `/boards/${id}`,
} as const;

/**
 * Get all boards for the authenticated user
 * GET /api/boards
 * Requires JWT token
 */
export const getBoards = async (): Promise<Board[]> => {
  const response = await apiClient.get<Board[]>(BOARD_ENDPOINTS.BOARDS);
  return response.data;
};

/**
 * Get a specific board by ID
 * GET /api/boards/:id
 * Requires JWT token
 */
export const getBoardById = async (id: string): Promise<Board> => {
  const response = await apiClient.get<Board>(BOARD_ENDPOINTS.BOARD_DETAILS(id));
  return response.data;
};

/**
 * Create a new board
 * POST /api/boards
 * Requires JWT token
 */
export const createBoard = async (payload: CreateBoardPayload): Promise<Board> => {
  const response = await apiClient.post<Board>(BOARD_ENDPOINTS.BOARDS, payload);
  return response.data;
};

/**
 * Update a board's title
 * PATCH /api/boards/:id
 * Requires JWT token
 */
export const updateBoard = async (id: string, payload: UpdateBoardPayload): Promise<Board> => {
  const response = await apiClient.patch<Board>(BOARD_ENDPOINTS.BOARD_DETAILS(id), payload);
  return response.data;
};

/**
 * Delete a board
 * DELETE /api/boards/:id
 * Requires JWT token
 */
export const deleteBoard = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(BOARD_ENDPOINTS.BOARD_DETAILS(id));
  return response.data;
};

// Default export
const boardService = {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
};

export default boardService;
