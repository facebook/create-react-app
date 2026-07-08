import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
  user: Schema.Types.ObjectId;
  course: Schema.Types.ObjectId;
  career?: Schema.Types.ObjectId;
  completedLessons: Schema.Types.ObjectId[];
  completedModules: Schema.Types.ObjectId[];
  progressPercentage: number;
  timeSpent: number;
  lastAccessedAt: Date;
  completedAt?: Date;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ILessonProgress extends Document {
  user: Schema.Types.ObjectId;
  lesson: Schema.Types.ObjectId;
  course: Schema.Types.ObjectId;
  watchedDuration: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    career: { type: Schema.Types.ObjectId, ref: 'Career' },
    completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    completedModules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    timeSpent: { type: Number, default: 0 },
    lastAccessedAt: { type: Date, default: Date.now },
    completedAt: Date,
    status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  },
  { timestamps: true }
);

const lessonProgressSchema = new Schema<ILessonProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    watchedDuration: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
  },
  { timestamps: true }
);

export const Progress = mongoose.model<IProgress>('Progress', progressSchema);
export const LessonProgress = mongoose.model<ILessonProgress>('LessonProgress', lessonProgressSchema);
