import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, Loading, Button } from '../components/Common';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, []);

  if (!user) return <Loading message="Loading dashboard..." />;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <h2 className="text-2xl font-bold mb-4">Welcome, {user.firstName}!</h2>
            <p className="text-gray-600 mb-4">Continue your learning journey</p>
            <Button onClick={() => navigate('/courses')}>Explore Courses</Button>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
            <div className="space-y-2">
              <p>Enrolled Careers: {user.enrolledCareers?.length || 0}</p>
              <p>Completed Courses: {user.completedCourses?.length || 0}</p>
              <p>Certificates: {user.certificates?.length || 0}</p>
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="text-2xl font-bold mb-4">Enrolled Careers</h2>
          {user.enrolledCareers && user.enrolledCareers.length > 0 ? (
            <div className="space-y-4">
              {user.enrolledCareers.map((career: any) => (
                <div
                  key={career._id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg">{career.title}</h3>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No enrolled careers yet</p>
          )}
        </Card>
      </div>
    </div>
  );
};
