import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Career from '../models/Career';
import Course from '../models/Course';
import { Module, Lesson } from '../models/Module';
import { Quiz } from '../models/Quiz';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/internship-training');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Career.deleteMany({}),
      Course.deleteMany({}),
      Module.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({}),
    ]);

    // Create admin user
    const admin = new User({
      email: 'admin@example.com',
      password: 'Admin@123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });
    await admin.save();

    // Create instructor user
    const instructor = new User({
      email: 'instructor@example.com',
      password: 'Instructor@123',
      firstName: 'John',
      lastName: 'Instructor',
      role: 'instructor',
    });
    await instructor.save();

    // Create careers
    const careerData = [
      {
        title: 'Full Stack Web Developer',
        description: 'Learn to build complete web applications',
        icon: '💻',
        duration: 6,
        difficulty: 'intermediate',
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
        prerequisites: ['Basic Programming', 'HTML/CSS Basics'],
        salaryRange: { min: 60, max: 120 },
        jobMarketDemand: 'High',
        featured: true,
      },
      {
        title: 'Data Scientist',
        description: 'Master data analysis and machine learning',
        icon: '📊',
        duration: 8,
        difficulty: 'advanced',
        skills: ['Python', 'SQL', 'Machine Learning', 'Data Visualization', 'Statistics'],
        prerequisites: ['Mathematics', 'Statistics Basics'],
        salaryRange: { min: 80, max: 150 },
        jobMarketDemand: 'Very High',
        featured: true,
      },
      {
        title: 'Mobile App Developer',
        description: 'Build iOS and Android applications',
        icon: '📱',
        duration: 5,
        difficulty: 'intermediate',
        skills: ['React Native', 'Swift', 'Kotlin', 'Mobile UI/UX'],
        prerequisites: ['JavaScript', 'Object-Oriented Programming'],
        salaryRange: { min: 65, max: 130 },
        jobMarketDemand: 'High',
        featured: true,
      },
    ];

    const careers = await Career.insertMany(careerData);
    console.log('✓ Created careers');

    // Create courses for each career
    for (let i = 0; i < careers.length; i++) {
      const courseData = {
        title: `${careers[i].title} Masterclass`,
        description: `Complete course for becoming a ${careers[i].title.toLowerCase()}`,
        instructor: instructor._id,
        career: careers[i]._id,
        thumbnail: `https://via.placeholder.com/300x200?text=${careers[i].title}`,
        duration: careers[i].duration * 10,
        difficulty: careers[i].difficulty,
        price: i === 0 ? 99 : i === 1 ? 149 : 99,
        isPublished: true,
      };

      const course = new Course(courseData);
      await course.save();

      // Create modules for each course
      for (let j = 0; j < 3; j++) {
        const moduleData = {
          title: `Module ${j + 1}: ${['Fundamentals', 'Advanced Concepts', 'Project'][j]}`,
          description: `Learn ${['the basics', 'advanced topics', 'through real projects'][j]}`,
          course: course._id,
          order: j + 1,
          duration: 120,
        };

        const module = new Module(moduleData);
        await module.save();

        // Create lessons for each module
        for (let k = 0; k < 2; k++) {
          const lessonData = {
            title: `Lesson ${k + 1}: Introduction`,
            description: 'Learn the fundamentals',
            module: module._id,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            videoDuration: 1800,
            order: k + 1,
            content: '# Lesson Content\n\nThis is the lesson content in markdown format.',
            resources: [
              {
                title: 'Lecture Slides',
                url: 'https://example.com/slides.pdf',
                type: 'pdf',
              },
              {
                title: 'GitHub Repository',
                url: 'https://github.com/example/repo',
                type: 'code',
              },
            ],
          };

          const lesson = new Lesson(lessonData);
          await lesson.save();

          // Add lesson to module
          module.lessons.push(lesson._id);
        }

        await module.save();

        // Add module to course
        course.modules.push(module._id);
      }

      await course.save();
      careers[i].courses.push(course._id);
    }

    await Promise.all(careers.map((c) => c.save()));

    // Create sample users
    const studentData = [
      {
        email: 'student1@example.com',
        password: 'Student@123',
        firstName: 'Alice',
        lastName: 'Smith',
        role: 'student',
      },
      {
        email: 'student2@example.com',
        password: 'Student@123',
        firstName: 'Bob',
        lastName: 'Johnson',
        role: 'student',
      },
    ];

    await User.insertMany(studentData);
    console.log('✓ Created users');

    console.log('✅ Database seeded successfully!');
    console.log('\nDefault Credentials:');
    console.log('Admin: admin@example.com / Admin@123');
    console.log('Instructor: instructor@example.com / Instructor@123');
    console.log('Student 1: student1@example.com / Student@123');
    console.log('Student 2: student2@example.com / Student@123');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
