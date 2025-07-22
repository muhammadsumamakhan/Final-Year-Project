import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section
      className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center bg-no-repeat px-6 sm:px-12 lg:px-24"
      style={{
        backgroundImage:
          'url("https://t4.ftcdn.net/jpg/02/54/80/85/360_F_254808568_fj6iuMwwzloSZYKbhDPShWzSK6GeEjXj.jpg")',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

      <div className="relative z-10 text-white max-w-4xl w-full text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight drop-shadow">
          Welcome to <span className="text-orange-400">FixWithUs</span>
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl font-medium mb-6 drop-shadow">
          Your trusted platform for computer repair and tech experts.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start mt-6">
          <Link
            to="ExpertLogin"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg shadow-md text-lg font-semibold transition-all duration-300"
          >
            Become an Expert
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;














