import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import { corsOrigins } from './config/env';
import { notFound, errorHandler } from './middleware/error.middleware';

import userRoutes from './routes/user.route';
import boardRoutes from './routes/board.route';
import taskRoutes from './routes/task.route';
import habitRoutes from './routes/habit.routes';
import statsRoutes from './routes/stats.route';
import dataRoutes from './routes/data.route';

const app = express();

app.use(helmet());
app.use(compression());

// 10mb: a full backup restored through POST /api/data/import blows past the
// 100kb default.
app.use(express.json({ limit: '10mb' }));

app.use(cors({
  origin: (origin, callback) => {
    // `!origin` covers native clients (Android) and curl, which send no Origin
    // header at all.
    if (!origin || corsOrigins.includes(origin)) return callback(null, true);

    const error: Error & { status?: number } = new Error(`Origin not allowed by CORS: ${origin}`);
    error.status = 403;
    return callback(error);
  },
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
app.use("/api/data", dataRoutes)

// Must stay last, and in this order.
app.use(notFound);
app.use(errorHandler);

export default app;
