import React from 'react';
import { LoginForm } from '../components/Auth';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <LoginForm />
      </div>
    </div>
  );
};
