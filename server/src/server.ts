import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT =process.env.PORT
app.use(express.json());

app.get("/ping",(req,res)=>{
    return res.status(200).json({message:'PONG!'});
})

app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
})