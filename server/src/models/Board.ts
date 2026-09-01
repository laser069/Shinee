import mongoose from 'mongoose';

const BoardSchema = new mongoose.Schema({
    tasks:[{type:mongoose.Schema.Types.ObjectId,ref:'Task'}],
    title:{type:String,required:true},
    user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
},
// timestamps keeps updatedAt fresh on every write (the manual field above was
// only ever set at creation), which cache-staleness checks key on.
{timestamps:true})

export default mongoose.model('Board',BoardSchema);