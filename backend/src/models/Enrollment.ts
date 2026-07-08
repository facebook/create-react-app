import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  user: Schema.Types.ObjectId;
  course: Schema.Types.ObjectId;
  career?: Schema.Types.ObjectId;
  enrollmentDate: Date;
  completionDate?: Date;
  status: 'active' | 'completed' | 'dropped';
  certificateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    career: { type: Schema.Types.ObjectId, ref: 'Career' },
    enrollmentDate: { type: Date, default: Date.now },
    completionDate: Date,
    status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
    certificateId: String,
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
