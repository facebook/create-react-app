import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/Common';
import { useAuth } from '../hooks/useAuth';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Welcome to InternTrain</h1>
        <p className="text-2xl mb-10">Master in-demand skills through structured learning paths</p>
        <div className="flex gap-4 justify-center mb-16">
          {isAuthenticated ? (
            <>
              <Button size="lg" onClick={() => navigate('/careers')}>
                Explore Careers
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" onClick={() => navigate('/register')}>
                Get Started
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                Login
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-gray-800">
            <h3 className="text-xl font-bold mb-4">Expert-Designed Paths</h3>
            <p>Structured learning paths created by industry experts</p>
          </Card>
          <Card className="text-gray-800">
            <h3 className="text-xl font-bold mb-4">Hands-On Projects</h3>
            <p>Real-world projects to build your portfolio</p>
          </Card>
          <Card className="text-gray-800">
            <h3 className="text-xl font-bold mb-4">Certificates</h3>
            <p>Earn recognized certificates upon completion</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
