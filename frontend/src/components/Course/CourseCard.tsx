import React from 'react';
import { Course } from '../../types';
import { Card, Button } from '../Common';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {course.thumbnail && (
        <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{course.description}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-blue-600">
            {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
          </span>
          <span className="text-sm text-gray-500">{course.duration} hours</span>
        </div>
        <Link to={`/courses/${course._id}`}>
          <Button className="w-full">View Course</Button>
        </Link>
      </div>
    </Card>
  );
};
