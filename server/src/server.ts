import express from 'express';
import 'dotenv/config';
import { env } from './config/env';
import ConnectDB from './config/db';
import cors from 'cors';

import userRoutes from './routes/user.route';
import boardRoutes from './routes/board.route';
import taskRoutes from './routes/task.route';
import habitRoutes from './routes/habit.routes';
import statsRoutes from './routes/stats.route';
import notificationRoutes from './routes/notification.route';

const app = express();
// const PORT =process.env.PORT
app.use(express.json());

// Enable CORS for frontend (port 3000)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

ConnectDB();

app.get("/ping",(req,res)=>{
    return res.status(200).json({message:'PONG!'});
})
app.use("/api/users",userRoutes);
app.use("/api/boards",boardRoutes);
app.use("/api/tasks",taskRoutes);
app.use("/api/habits",habitRoutes)
app.use("/api/stats",statsRoutes)
app.use("/api/notifications",notificationRoutes)
app.listen(env.PORT,()=>{
    console.log(`Server running at http://localhost:${env.PORT}`);
})