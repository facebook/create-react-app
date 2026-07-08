import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: Schema.Types.ObjectId;
  career: Schema.Types.ObjectId;
  thumbnail: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  modules: Schema.Types.ObjectId[];
  prerequisites: Schema.Types.ObjectId[];
  enrollmentCount: number;
  rating: number;
  reviews: Array<{ userId: Schema.Types.ObjectId; rating: number; comment: string; createdAt: Date }>;
  price: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    career: { type: Schema.Types.ObjectId, ref: 'Career', required: true },
    thumbnail: String,
    duration: { type: Number, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    modules: [{ type: Schema.Types.ObjectId, ref: 'Module' }],
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    enrollmentCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    price: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ICourse>('Course', courseSchema);
