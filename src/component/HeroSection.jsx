import React from 'react';
import { Link } from 'react-router-dom';


const HeroSection = () => {
  return (
    <section
      className="bg-gray-100 py-20 px-6 min-h-[70vh] md:min-h-[60vh] lg:min-h-[80vh] flex flex-col justify-center items-center sm:items-start"
      style={{
        backgroundImage:
          'url("https://t4.ftcdn.net/jpg/02/54/80/85/360_F_254808568_fj6iuMwwzloSZYKbhDPShWzSK6GeEjXj.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="pl-[44px] w-full sm:w-auto">
        <div className="max-w-4xl text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Welcome To Repair Service
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6">
            Trusted Computer And Repair Experts!
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
          <Link to="/ExpertLogin">
            <button className="px-8 py-3 bg-orange-500 text-white rounded-md shadow-md hover:bg-orange-600 transition-all">
              I Become an Expert
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
