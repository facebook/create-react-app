import React from 'react';
import { RegisterForm } from '../components/Auth';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <RegisterForm />
      </div>
    </div>
  );
};
