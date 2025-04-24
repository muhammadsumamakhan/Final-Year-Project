import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SingleExpert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the expert data based on the ID
  useEffect(() => {
    const fetchExpert = async () => {
      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch expert details');
        }
        const result = await response.json();
        setExpert(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExpert();
  }, [id]);

  if (loading) return <p className="text-center text-lg text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-500">Error: {error}</p>;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 sm:px-6 md:px-16 lg:px-32">
        <button
          onClick={() => navigate('/allexpert')}
          className="flex items-center text-white text-lg sm:text-xl md:text-2xl font-bold transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Expert List's
        </button>
      </header>

      {/* Expert Details */}
      <div className="flex flex-col items-center bg-gray-100 p-6 sm:p-8 md:p-10 lg:p-12 rounded-lg shadow-md w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 max-w-full mt-[50px] mx-auto mb-0"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
          <img
            src={`https://via.placeholder.com/150`}
            alt={`Profile picture of ${expert.name}`}
            className="w-32 h-32 rounded-full object-cover"
          />
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-800">{expert.name}</h2>
            <p className="text-gray-600 mt-1">Email: {expert.email}</p>
            <p className="text-gray-600">Phone: {expert.phone}</p>
            <p className="text-gray-600">
              Website:{' '}
              <a
                href={`https://${expert.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {expert.website}
              </a>
            </p>
            <p className="text-gray-600 mt-1">Company: {expert.company.name}</p>
            <p className="text-gray-600">
              Address: {`${expert.address.suite}, ${expert.address.street}, ${expert.address.city}, ${expert.address.zipcode}`}
            </p>
            <button className="mt-4 px-8 py-2 bg-[#0D003B] text-white font-semibold rounded-lg shadow-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleExpert;
