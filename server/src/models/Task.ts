import mongoose, { Schema, Document } from 'mongoose';

export interface ITag {
  name: string;
  color: string;
}

export interface IRecurrence {
  type: 'daily' | 'weekly';
  interval: number;
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
  recurrence?: IRecurrence | null;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>({
  name: { type: String, required: true, trim: true, maxlength: 30 },
  color: { type: String, required: true },
}, { _id: false });

const recurrenceSchema = new Schema<IRecurrence>({
  type: { type: String, enum: ['daily', 'weekly'], required: true },
  interval: { type: Number, default: 1, min: 1 },
}, { _id: false });

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
  recurrence: { type: recurrenceSchema, default: null },
}, { timestamps: true });

// Exporting as "Task"
const Task = mongoose.model<ITask>('Task', taskSchema);
export default Task;