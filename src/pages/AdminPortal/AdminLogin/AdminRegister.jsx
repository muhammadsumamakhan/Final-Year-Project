import React from 'react';
import { Link } from 'react-router-dom';

const AdminRegister = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white mt-10 mb-10 p-10 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Admin Registration
        </h2>
        <form className="space-y-6">
          {/* Input fields in two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-600">Full Name</label>
              <input
                type="text"
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500"
                placeholder="Admin Name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-600">Email</label>
              <input
                type="email"
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500"
                placeholder="admin@example.com"
                required
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-semibold text-gray-600">Contact</label>
              <input
                type="tel"
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500"
                placeholder="123-456-7890"
                required
              />
            </div>

            {/* CNIC */}
            <div>
              <label className="block text-sm font-semibold text-gray-600">CNIC</label>
              <input
                type="text"
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500"
                placeholder="42101-1234567-1"
                required
              />
            </div>

            {/* Address (Full width) */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-600">Address</label>
              <input
                type="text"
                className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring focus:ring-orange-500"
                placeholder="123 Main St, City, Country"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-600">Your Image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full mt-2 border p-2 rounded-lg"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center space-x-2">
            <input type="checkbox" required className="rounded" />
            <span className="text-gray-600">
              I agree to the{' '}
              <a href="#" className="text-blue-500 hover:underline">
                terms and conditions
              </a>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#0D003B] text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-300"
          >
            Register
          </button>

          {/* Login Link */}
          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">Already have an account? </span>
            <Link to="/AdminLogin" className="text-blue-500 hover:underline">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;
