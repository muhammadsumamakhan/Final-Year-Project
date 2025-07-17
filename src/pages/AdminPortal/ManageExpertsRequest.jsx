import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase/config';

const ManageExpertsRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "ExpertQuiz"));
      const pendingRequests = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === "Pending") {
          pendingRequests.push({ id: docSnap.id, ...data });
        }
      });
      setRequests(pendingRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await updateDoc(doc(db, "ExpertQuiz", id), {
        status: action,
      });
      setRequests((prev) =>
        prev.filter((request) => request.id !== id)
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) return <div className="p-4">Loading requests...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending Expert Quiz Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white"
            >
              <p><strong>Email:</strong> {req.email}</p>
              <p><strong>Score:</strong> {req.score} / {req.total}</p>
              <p><strong>Percentage:</strong> {req.percentage}%</p>
              <p><strong>Result:</strong> {req.result}</p>
              <p><strong>Status:</strong> {req.status}</p>
              <div className="mt-3 space-x-3">
                <button
                  onClick={() => handleAction(req.id, "Accepted")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleAction(req.id, "Rejected")}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageExpertsRequest;
