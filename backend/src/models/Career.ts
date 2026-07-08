import mongoose, { Schema, Document } from 'mongoose';

export interface ICareer extends Document {
  title: string;
  description: string;
  icon: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  prerequisites: string[];
  courses: Schema.Types.ObjectId[];
  salaryRange: { min: number; max: number };
  jobMarketDemand: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const careerSchema = new Schema<ICareer>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    duration: { type: Number, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    skills: [String],
    prerequisites: [String],
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    salaryRange: { min: Number, max: Number },
    jobMarketDemand: String,
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ICareer>('Career', careerSchema);
