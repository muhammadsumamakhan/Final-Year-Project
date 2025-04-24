import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ExpertTest = () => {
  const navigate = useNavigate();
  const [isRequestApproved, setIsRequestApproved] = useState(null); // null for initial loading state
  const [errorMessage, setErrorMessage] = useState(""); // Error state for Google Form

  // Simulate API call to fetch request status
  useEffect(() => {
    // Simulated API delay
    setTimeout(() => {
      // Replace this with real API call
      const mockApiResponse = { approved: false }; // Simulated API response
      setIsRequestApproved(mockApiResponse.approved);
    }, 1000);
  }, []);

  const handleApplyForTest = () => {
    try {
      window.open("https://forms.google.com/example-form-link", "_blank");
    } catch (error) {
      console.error("Error opening the form:", error);
      setErrorMessage("Failed to open the Google Form. Please try again later.");
    }
  };

  const handleApproveRequest = () => {
    setIsRequestApproved(true); // Simulate approval for demo purposes
  };

  return (
    <div>
      {/* Header Section */}
      <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 md:px-16 lg:px-[166px]">
        <h1 className="text-white text-2xl md:text-3xl font-bold">Test Status</h1>
      </header>

      {/* Main Content */}
      <main className="px-6 md:px-16 lg:px-[166px] mt-10 mb-10" role="main">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Instructions</h2>
        <ol className="list-decimal pl-5 text-gray-600 space-y-2">
          <li>Ensure your profile details are accurate and complete.</li>
          <li>Familiarize yourself with the test format and guidelines.</li>
          <li>Allocate sufficient uninterrupted time for the test.</li>
          <li>Use a stable internet connection to avoid disruptions.</li>
          <li>Adhere to the ethical code while attempting the test.</li>
          <li>Submit the test application before the deadline.</li>
        </ol>

        {/* Button Section */}
        <div className="mt-6">
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
            onClick={handleApplyForTest}
            aria-label="Apply for the expert test"
          >
            Apply for Test
          </button>
          {errorMessage && (
            <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Clicking the button will redirect you to a Google Form for a sample test.
          </p>
        </div>

        {/* Status Section */}
        <div className="mt-10" aria-live="polite">
          {isRequestApproved === null ? (
            <div className="bg-blue-100 p-4 rounded-lg shadow">
              <h1 className="text-lg font-semibold text-blue-700">
                Loading Request Status...
              </h1>
              <p className="text-gray-600">Please wait while we fetch your request status.</p>
            </div>
          ) : !isRequestApproved ? (
            <div className="bg-yellow-100 p-4 rounded-lg shadow">
              <h1 className="text-lg font-semibold text-yellow-700">
                Request Pending
              </h1>
              <p className="text-gray-600">
                Your test application is under review. Please wait for approval.
              </p>
              <button
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
                onClick={handleApproveRequest}
                aria-label="Simulate Approval"
              >
                Simulate Approval
              </button>
            </div>
          ) : (
            <div className="bg-green-100 p-4 rounded-lg shadow">
              <h1 className="text-lg font-semibold text-green-700">
                Request Approved
              </h1>
              <p className="text-gray-600">
                Congratulations! Welcome to the team.
              </p>
              <button
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                onClick={() => navigate("/expertportal")}
                aria-label="Navigate to Expert Portal"
              >
                Continue to Expert Portal
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExpertTest;
