import { Quiz, QuizAttempt } from '../models/Quiz';

export const quizService = {
  async createQuizAttempt(userId: string, quizId: string, courseId: string, answers: any[]): Promise<any> {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new Error('Quiz not found');

    let score = 0;
    let correctAnswers = 0;

    quiz.questions.forEach((question: any, index: number) => {
      const userAnswer = answers[index]?.userAnswer;
      const isCorrect = Array.isArray(question.correctAnswer)
        ? JSON.stringify(userAnswer?.sort()) === JSON.stringify(question.correctAnswer.sort())
        : userAnswer === question.correctAnswer;

      if (isCorrect) {
        correctAnswers++;
        score += 100 / quiz.questions.length;
      }
    });

    const passed = score >= quiz.passingScore;

    const attempt = new QuizAttempt({
      user: userId,
      quiz: quizId,
      course: courseId,
      answers,
      score: Math.round(score),
      percentage: Math.round((correctAnswers / quiz.questions.length) * 100),
      passed,
    });

    await attempt.save();
    return attempt;
  },

  async getQuizAttempts(userId: string, quizId: string): Promise<any[]> {
    return QuizAttempt.find({ user: userId, quiz: quizId }).sort({ createdAt: -1 });
  },
};
