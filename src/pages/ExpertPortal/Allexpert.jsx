import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Allexpert = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  // Fetching data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const result = await response.json();
      console.log(result);
      setData(result);
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Header */}
      <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 md:px-16 lg:px-[166px]">
        <button
          onClick={() => navigate('/userservice')}
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
          Back to Service
        </button>
      </header>

      {/* List of experts */}
      <main className="p-6 md:p-16 mt-4">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Expert List</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.length > 0 ? (
            data.map((expert) => (
              <div key={expert.id} className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition">
                {/* Expert Info */}
                <div className="flex items-center">
                  <img
                    onClick={() => navigate(`/expert/${expert.id}`)}
                    src={`https://www.gravatar.com/avatar/${expert.email}?d=identicon`}
                    alt={`Profile picture of ${expert.name}`}
                    className="w-20 h-20 rounded-full mb-4 object-cover cursor-pointer"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">{expert.name}</h3>
                    <p className="text-gray-600">Email: {expert.email}</p>
                    <p className="text-gray-600">Phone: {expert.phone}</p>
                    <p className="text-gray-600">Website: {expert.website}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Loading experts...</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Allexpert;
