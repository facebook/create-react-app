import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  bio?: string;
  phone?: string;
  role: 'student' | 'instructor' | 'admin';
  enrolledCareers: Schema.Types.ObjectId[];
  completedCourses: Schema.Types.ObjectId[];
  certificates: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profileImage: String,
    bio: String,
    phone: String,
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    enrolledCareers: [{ type: Schema.Types.ObjectId, ref: 'Career' }],
    completedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    certificates: [{ type: Schema.Types.ObjectId, ref: 'Certificate' }],
  },
  { timestamps: true }
);

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcryptjs.compare(password, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
