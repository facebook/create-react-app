import mongoose, { Schema, Document } from 'mongoose';

export interface IModule extends Document {
  title: string;
  description: string;
  course: Schema.Types.ObjectId;
  lessons: Schema.Types.ObjectId[];
  order: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILesson extends Document {
  title: string;
  description: string;
  module: Schema.Types.ObjectId;
  videoUrl: string;
  videoDuration: number;
  order: number;
  content: string;
  resources: Array<{ title: string; url: string; type: 'pdf' | 'link' | 'code' | 'document' }>;
  quiz?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    order: { type: Number, required: true },
    duration: { type: Number, required: true },
  },
  { timestamps: true }
);

const lessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    videoUrl: { type: String, required: true },
    videoDuration: { type: Number, required: true },
    order: { type: Number, required: true },
    content: { type: String, required: true },
    resources: [
      {
        title: String,
        url: String,
        type: { type: String, enum: ['pdf', 'link', 'code', 'document'] },
      },
    ],
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  },
  { timestamps: true }
);

export const Module = mongoose.model<IModule>('Module', moduleSchema);
export const Lesson = mongoose.model<ILesson>('Lesson', lessonSchema);
