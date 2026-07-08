import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCareer } from '../hooks/useCareer';
import { Loading, Card, Button } from '../components/Common';
import { Link } from 'react-router-dom';

export const CareerPage: React.FC = () => {
  const { user } = useAuth();
  const { careers, loading, fetchCareers } = useCareer();

  useEffect(() => {
    fetchCareers();
  }, []);

  if (loading) return <Loading message="Loading careers..." />;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center">Career Paths</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {careers.map((career) => (
            <Card key={career._id} className="hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{career.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{career.title}</h3>
              <p className="text-gray-600 mb-4">{career.description}</p>
              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-semibold">Duration:</span> {career.duration} months
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Level:</span>{' '}
                  {career.difficulty.charAt(0).toUpperCase() + career.difficulty.slice(1)}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Salary:</span> ${career.salaryRange.min}k -
                  ${career.salaryRange.max}k
                </p>
              </div>
              <Link to={`/careers/${career._id}`}>
                <Button className="w-full">Explore Path</Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
