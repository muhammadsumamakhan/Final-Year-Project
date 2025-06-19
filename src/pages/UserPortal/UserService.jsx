import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserService = () => {
    const navigate = useNavigate();

    return (
        <div>
            {/* Header */}
            <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 sm:px-6 md:px-16 lg:px-32">
                <button
                    onClick={() => navigate('/userportal')}
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
                    Back to Portal
                </button>
            </header>

            {/* Main Content */}
            <main className="flex flex-col md:flex-row justify-center items-center gap-6 mt-[50px] mb-[50px] px-6 sm:px-8 md:px-16 lg:px-12">
                {/* Physical Service Section */}
                <section className="flex flex-col items-center bg-gray-100 p-8 sm:p-[40px] md:p-[60px] lg:p-[60px] rounded-lg shadow-md w-full sm:w-3/4 md:w-[500px] lg:w-[500px] max-w-full h-[300px]">
                    <h2 className="text-2xl sm:text-3xl md:text-3xl font-semibold text-gray-700 mb-2">Physical Service</h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 text-center mb-4">
                        If you require on-site assistance, choose this option to find a qualified expert for physical repairs.
                    </p>
                    <button
                        onClick={() => navigate('/allexpert?type=physical')}
                        className="mt-4 px-10 py-2 bg-[#0D003B] text-white font-semibold rounded-lg shadow-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    >
                        Find Expert
                    </button>
                </section>

                {/* Virtual Service Section */}
                <section className="flex flex-col items-center bg-gray-100 p-8 sm:p-[40px] md:p-[60px] lg:p-[60px] rounded-lg shadow-md w-full sm:w-3/4 md:w-[500px] lg:w-[500px] max-w-full h-[300px]">
                    <h2 className="text-2xl sm:text-3xl md:text-3xl font-semibold text-gray-700 mb-2">Virtual Service</h2>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 text-center mb-4">
                        If you're unsure about the issue or need a virtual consultation, choose this option for remote diagnosis and troubleshooting.
                    </p>
                    <button
                        onClick={() => navigate('/allexpert?type=virtual')}
                        className="mt-4 px-10 py-2 bg-[#0D003B] text-white font-semibold rounded-lg shadow-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    >
                        Find Expert
                    </button>
                </section>
            </main>
        </div>
    );
};

export default UserService;
