import mongoose from 'mongoose';

const BoardSchema = new mongoose.Schema({
    tasks:[{type:mongoose.Schema.Types.ObjectId,ref:'Task'}],
    title:{type:String,required:true},
    user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
})

export default mongoose.model('Board',BoardSchema);