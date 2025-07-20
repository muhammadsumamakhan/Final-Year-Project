import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase/config';
import { useNavigate } from 'react-router-dom';

const ManageExpertsRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Real-time fetch using onSnapshot
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'ExpertQuiz'), (snapshot) => {
      const fetchedRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(fetchedRequests);
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  // Update status of the request
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'ExpertQuiz', id), {
        status: newStatus
      });
      // No need to call fetchRequests – UI updates automatically
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) return <div className="p-4">Loading requests...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 sm:px-6 md:px-16 lg:px-32">
        <button
          onClick={() => navigate('/adminportal')}
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
          Manage Expert Quiz Requests
        </button>
      </header>

      {/* Title */}
      <h1 className="text-2xl font-bold mt-12 mb-4 text-center text-orange-600">Manage Expert Quiz Requests</h1>

      {/* Content */}
      {requests.length === 0 ? (
        <p className="text-center text-gray-500">No quiz requests found.</p>
      ) : (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">👤 {req.email}</h2>
                    <p className="text-sm text-gray-500">Score: {req.score}/{req.total} ({req.percentage}%)</p>
                    <p className="text-sm text-gray-500">Result: {req.result}</p>
                    <div className="mt-1">
                      <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${req.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : req.status === "Accepted"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>

                  {req.status === "Pending" && (
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button
                        onClick={() => handleStatusChange(req.id, 'Accepted')}
                        className="px-4 py-2 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(req.id, 'Rejected')}
                        className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

};

export default ManageExpertsRequest;






