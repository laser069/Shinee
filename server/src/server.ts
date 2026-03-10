import express from 'express';
import 'dotenv/config';
import { env } from './config/env';
import { connect } from 'node:http2';
import ConnectDB from './config/db';


const app = express();
// const PORT =process.env.PORT
app.use(express.json());

ConnectDB();

app.get("/ping",(req,res)=>{
    return res.status(200).json({message:'PONG!'});
})

app.listen(env.PORT,()=>{
    console.log(`Server running at http://localhost:${env.PORT}`);
})