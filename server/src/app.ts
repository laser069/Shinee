import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import userRoutes from './routes/user.route';
import boardRoutes from './routes/board.route';
import taskRoutes from './routes/task.route';
import habitRoutes from './routes/habit.routes';
import statsRoutes from './routes/stats.route';

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.get("/ping", (req, res) => {
  return res.status(200).json({ message: 'PONG!' });
})
app.use("/api/users", userRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/habits", habitRoutes)
app.use("/api/stats", statsRoutes)

export default app;
