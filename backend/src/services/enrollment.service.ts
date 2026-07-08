import { User } from '../models/User';

export const enrollmentService = {
  async enrollUserInCareer(userId: string, careerId: string): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { enrolledCareers: careerId } },
      { new: true }
    );
  },

  async isUserEnrolledInCareer(userId: string, careerId: string): Promise<boolean> {
    const user = await User.findById(userId);
    return user ? user.enrolledCareers.includes(careerId) : false;
  },

  async removeEnrollment(userId: string, careerId: string): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      { $pull: { enrolledCareers: careerId } },
      { new: true }
    );
  },
};
