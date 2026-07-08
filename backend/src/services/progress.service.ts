import { Progress } from '../models/Progress';
import { Course } from '../models/Course';
import { Module } from '../models/Module';

export const progressService = {
  async calculateCourseProgress(userId: string, courseId: string): Promise<number> {
    const progress = await Progress.findOne({ user: userId, course: courseId }).populate('completedModules');
    
    if (!progress) return 0;
    
    const course = await Course.findById(courseId).populate('modules');
    if (!course || !course.modules) return 0;
    
    const totalModules = course.modules.length;
    const completedModules = progress.completedModules.length;
    
    return totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  },

  async generateRoadmap(careerId: string): Promise<any> {
    const Career = require('../models/Career').default;
    const career = await Career.findById(careerId).populate({
      path: 'courses',
      populate: { path: 'modules', populate: { path: 'lessons' } },
    });

    if (!career) return null;

    return {
      career: career.title,
      duration: career.duration,
      difficulty: career.difficulty,
      stages: career.courses.map((course: any, index: number) => ({
        stage: index + 1,
        title: course.title,
        duration: course.duration,
        modules: course.modules.length,
        description: course.description,
      })),
    };
  },

  async generateCertificate(userId: string, courseId: string, enrollmentId: string): Promise<string> {
    const crypto = require('crypto');
    const certificateId = crypto.randomBytes(16).toString('hex');
    return `cert_${certificateId}`;
  },
};
