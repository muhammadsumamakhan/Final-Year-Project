import React from 'react';

const About = () => {
  return (
    <section className="flex items-center justify-center py-12">
      <div className="flex flex-col lg:flex-row max-w-6xl mx-auto px-4">
   
        <div className="flex-1 mr-0 lg:mr-8">
          <img
            src="https://media.istockphoto.com/id/625135580/photo/laptop-disassembling-with-screwdriver-at-repair.jpg?s=612x612&w=0&k=20&c=Em-dB6fevNhRd5yaIxcgjDfFxuTVT4OSm_ys_Ybke6c="
            alt="Technician repairing a laptop motherboard"
            className="w-full h-[450px] lg:w-[700px] rounded-lg shadow-lg object-cover"
          />
        </div>

       
        <div className="flex-1 mt-8 lg:mt-0">
          <h1 className="text-lg text-[#f15523] font-semibold">ABOUT US</h1>
          <h2 className="text-4xl font-bold text-gray-900 mt-2 leading-tight">
            Empowering Your Devices: <br />
            Crafting Solutions
          </h2>
          <p className="text-[0.9rem] text-gray-700 mt-3">
            Welcome to <strong className='font-bold text-[1rem] text-[#0D003B]'>MSK</strong>, where technology meets expertise. With a passion for problem-solving and a dedication to exceptional service, we offer solutions that cater to your needs.
          </p>
          <ul className="list-disc pl-6 font-bold text-[1rem] text-[#0D003B] mt-4">
            <li>Expert Technicians</li>
            <li>Quality Repairs</li>
            <li>Quick Turnaround</li>
          </ul>
          <p className="text-[0.9rem] text-gray-700 mt-3">
            Our mission is to provide reliable, efficient, and affordable repair services, ensuring that your devices are restored to optimal functionality. We understand the vital role technology plays in your daily life, and we are committed to keeping you connected.
          </p>
          <button className="mt-6 px-6 py-3 bg-[#0D003B] text-white font-semibold rounded-lg shadow-lg hover:bg-orange-500 transition-all">
            More About Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;
