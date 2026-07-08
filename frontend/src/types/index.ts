export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  bio?: string;
  phone?: string;
  role: 'student' | 'instructor' | 'admin';
  enrolledCareers: Career[];
  completedCourses: Course[];
  certificates: Certificate[];
}

export interface Career {
  _id: string;
  title: string;
  description: string;
  icon: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  prerequisites: string[];
  courses: Course[];
  salaryRange: { min: number; max: number };
  jobMarketDemand: string;
  featured: boolean;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: User;
  career: Career;
  thumbnail: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  modules: Module[];
  prerequisites: Course[];
  enrollmentCount: number;
  rating: number;
  reviews: Review[];
  price: number;
  isPublished: boolean;
}

export interface Module {
  _id: string;
  title: string;
  description: string;
  course: string;
  lessons: Lesson[];
  order: number;
  duration: number;
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  module: string;
  videoUrl: string;
  videoDuration: number;
  order: number;
  content: string;
  resources: Resource[];
  quiz?: Quiz;
}

export interface Resource {
  title: string;
  url: string;
  type: 'pdf' | 'link' | 'code' | 'document';
}

export interface Review {
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Progress {
  _id: string;
  user: string;
  course: string;
  career?: string;
  completedLessons: Lesson[];
  completedModules: Module[];
  progressPercentage: number;
  timeSpent: number;
  lastAccessedAt: Date;
  completedAt?: Date;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface Enrollment {
  _id: string;
  user: string;
  course: Course;
  career?: Career;
  enrollmentDate: Date;
  completionDate?: Date;
  status: 'active' | 'completed' | 'dropped';
  certificateId?: string;
}

export interface Quiz {
  _id: string;
  lesson: string;
  title: string;
  description: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number;
}

export interface Question {
  _id: string;
  questionText: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
}

export interface Certificate {
  _id: string;
  user: string;
  course: Course;
  enrollmentId: string;
  issuedDate: Date;
  certificateUrl: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
