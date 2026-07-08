import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCourse } from '../hooks/useProgress';
import { Loading } from '../components/Common';
import { CourseCard } from '../components/Course';

export const CoursePage: React.FC = () => {
  const { user } = useAuth();
  const { courses, loading, fetchCourses } = useCourse();

  useEffect(() => {
    fetchCourses({ published: true });
  }, []);

  if (loading) return <Loading message="Loading courses..." />;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center">Courses</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No courses available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
