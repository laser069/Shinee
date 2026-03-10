import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    status:{type:String,enum:['todo','inprogress','done'],default:'todo'},
    user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
})

export default mongoose.model('Task',taskSchema);