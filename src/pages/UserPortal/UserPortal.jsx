import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserPortal = () => {
    const navigate = useNavigate(); // Initialize useNavigate hook for navigation

    return (
        <div>
            {/* Header Section */}
            <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 md:px-16 lg:px-[166px]">
                <h1 className="text-white text-2xl md:text-3xl font-bold">User Portal</h1>
            </header>

            {/* Main Content Section */}
            <main className="flex flex-col md:flex-row justify-center items-center gap-6 mt-[50px] mb-[50px] px-6 md:px-16 lg:px-[166px]">
                {/* Section for users who know the issue */}
                <section className="flex flex-col items-center bg-gray-100 p-8 sm:p-[60px] md:p-[90px] rounded-lg shadow-md w-full sm:w-3/4 md:w-[600px] h-[300px]">
                    <h2 className="text-2xl sm:text-3xl md:text-3xl font-semibold text-gray-700 mb-2">
                        If you know the issue
                    </h2>
                    <p className="text-base sm:text-lg md:text-base text-gray-600 text-center mb-4">
                        Provide details about the issue to proceed.
                    </p>
                    <button
                        onClick={() => navigate('/userservice')}
                        className="mt-4 px-10 py-2 bg-[#0D003B] text-white font-semibold rounded-lg shadow-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    >
                        Next
                    </button>
                </section>

                {/* Section for users who don't know the issue */}
                <section className="flex flex-col items-center bg-gray-100 p-8 sm:p-[60px] md:p-[90px] rounded-lg shadow-md w-full sm:w-3/4 md:w-[600px] h-[300px]">
                    <h2 className="text-2xl sm:text-3xl md:text-3xl font-semibold text-gray-700 mb-2">
                        If you don't know the issue
                    </h2>
                    <p className="text-base sm:text-lg md:text-base text-gray-600 text-center mb-4">
                        Get assistance to diagnose the issue.
                    </p>
                    <button
                        onClick={() => navigate('/allexpert')}
                        className="mt-4 px-10 py-2 bg-[#0D003B] text-white font-semibold rounded-lg shadow-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    >
                        Next
                    </button>
                </section>
            </main>
        </div>
    );
};

export default UserPortal;
