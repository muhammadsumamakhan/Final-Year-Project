import React from 'react';
import { Link } from 'react-router-dom';

const AdminLogin = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {/* Login Container */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-[30rem]">
        {/* Admin Welcome Text */}
        <h2 className="text-orange-500 text-3xl mr-4 text-center">
          Welcome, Admin!
        </h2>
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Login</h1>

        {/* Input Fields */}
        <div className="mb-6">
          <input
            type="email"
            placeholder="Admin Email"
            className="w-full p-4 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <input
            type="password"
            placeholder="Admin Password"
            className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {/* Login Button */}
        <button className="w-full bg-[#0D003B] text-white p-3 rounded hover:bg-orange-600 transition duration-200 mb-4">
          Login
        </button>

        {/* Register Link */}
        <div className="text-center mt-4">
          <p className="text-gray-600">Don't have an admin account?</p>
          <button className="text-blue-500 hover:underline">
            <Link to="/AdminRegister">Register here</Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
