import mongoose, { Schema, Document } from 'mongoose';

export interface ITag {
  name: string;
  color: string;
}

export interface ISubtask {
  title: string;
  completed: boolean;
}

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
  tags: ITag[];
  subtasks: ISubtask[];
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>({
  name: { type: String, required: true, trim: true, maxlength: 30 },
  color: { type: String, required: true },
}, { _id: false });

const subtaskSchema = new Schema<ISubtask>({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  completed: { type: Boolean, default: false },
}, { _id: true });

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
  targetDuration: { type: Number }, // Optional, no hardcoded default

  tags: { type: [tagSchema], default: [] },
  subtasks: { type: [subtaskSchema], default: [] },
}, { timestamps: true });

// Exporting as "Task"
const Task = mongoose.model<ITask>('Task', taskSchema);
export default Task;