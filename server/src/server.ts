import express from 'express';
import 'dotenv/config';
import { env } from './config/env';
import ConnectDB from './config/db';
import userRoutes from './routes/user.route';
import cors from 'cors';

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
app.listen(env.PORT,()=>{
    console.log(`Server running at http://localhost:${env.PORT}`);
})