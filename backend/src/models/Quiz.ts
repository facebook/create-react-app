import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  lesson: Schema.Types.ObjectId;
  title: string;
  description: string;
  questions: Array<{
    _id: Schema.Types.ObjectId;
    questionText: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer';
    options?: string[];
    correctAnswer: string | string[];
    explanation: string;
  }>;
  passingScore: number;
  timeLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizAttempt extends Document {
  user: Schema.Types.ObjectId;
  quiz: Schema.Types.ObjectId;
  course: Schema.Types.ObjectId;
  answers: Array<{ questionId: Schema.Types.ObjectId; userAnswer: string | string[] }>;
  score: number;
  percentage: number;
  passed: boolean;
  attemptedAt: Date;
  timeTaken: number;
  createdAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    title: { type: String, required: true },
    description: String,
    questions: [
      {
        questionText: { type: String, required: true },
        type: { type: String, enum: ['multiple_choice', 'true_false', 'short_answer'], required: true },
        options: [String],
        correctAnswer: Schema.Types.Mixed,
        explanation: String,
      },
    ],
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    timeLimit: Number,
  },
  { timestamps: true }
);

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, required: true },
        userAnswer: Schema.Types.Mixed,
      },
    ],
    score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    attemptedAt: { type: Date, default: Date.now },
    timeTaken: Number,
  },
  { timestamps: true }
);

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);
export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);
