import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ExpertTest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleApplyForTest = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/expertquiz");
    }, 1500);
  };

  return (
    <div>
      <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 md:px-16 lg:px-[166px]">
        <h1 className="text-white text-2xl md:text-3xl font-bold">Expert Test</h1>
      </header>

      <main className="px-6 md:px-16 lg:px-[166px] mt-10 mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Instructions</h2>
        <ol className="list-decimal pl-5 text-gray-600 space-y-2 mb-6">
          <li>Ensure your profile details are accurate and complete.</li>
          <li>Familiarize yourself with the test format and guidelines.</li>
          <li>Allocate sufficient uninterrupted time for the test.</li>
          <li>Use a stable internet connection to avoid disruptions.</li>
          <li>Adhere to the ethical code while attempting the test.</li>
        </ol>

        <button
          onClick={handleApplyForTest}
          disabled={loading}
          className={`${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
          } text-white font-semibold py-2 px-6 rounded transition duration-200`}
        >
          {loading ? "Loading..." : "Apply For Test"}
        </button>


        after Quiz attempt ke show status fail / pa
      </main>
    </div>
  );
};

export default ExpertTest;
