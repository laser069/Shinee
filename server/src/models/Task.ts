import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'inprogress' | 'done';
  user: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  dueDate?: Date;
  totalTimeSpent: number;
  activeStartTime?: Date | null;
  targetDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['todo', 'inprogress', 'done'], 
    default: 'todo' 
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  
  // Time Tracking Fields
  dueDate: { type: Date },
  totalTimeSpent: { type: Number, default: 0 },
  activeStartTime: { type: Date, default: null },
  targetDuration: { type: Number, default: 7200000 }, // 2 hours in ms
}, { timestamps: true });

// Exporting as "Task"
const Task = mongoose.model<ITask>('Task', taskSchema);
export default Task;