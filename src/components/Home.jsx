import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to Projects Nidaan</h1>
      <p className="text-lg mb-6">Your one-stop solution for project management.</p>
    </div>
  );
}

export default Home;
