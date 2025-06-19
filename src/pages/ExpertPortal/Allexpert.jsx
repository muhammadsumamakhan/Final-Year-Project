import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase/config";
import { useLocation } from "react-router-dom";

const Allexpert = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type"); // 'physical' or 'virtual'

  // Fetching data from Firestore when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "FYPusers"));

        // ✅ Only show users with role "expert"
        const expertsList = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => {
            if (user.role !== "expert") return false;
            if (type === "physical") {
              return user.serviceArea === "On-site" || user.serviceArea === "Both Remote / On-site";
            } else if (type === "virtual") {
              return user.serviceArea === "Remote" || user.serviceArea === "Both Remote / On-site";
            }
            return true;
          });

        setData(expertsList);
      } catch (error) {
        console.error("Error fetching experts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  return (
    <div>
      {/* Header */}
      <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 md:px-16 lg:px-[166px]">
        <button
          onClick={() => navigate("/userservice")}
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
        {loading ? (
          <p>Loading experts...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {data.length > 0 ? (
    data.map((expert) => (
      <div
        key={expert.id}
        className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition duration-300"
      >
        {/* Top: Profile Image and Info */}
        <div className="flex items-start gap-4">
          <img
            onClick={() => navigate(`/expert/${expert.id}`)}
            src={expert.profileUrl || "/default-profile.png"}
            alt={`Profile of ${expert.fullName}`}
            className="w-20 h-20 rounded-full object-cover cursor-pointer border-2 border-orange-500"
          />
          <div className="flex flex-col justify-start">
            <h3 className="text-xl font-semibold text-gray-800">{expert.fullName}</h3>
            <p className="text-sm text-gray-500">{expert.email}</p>
            <p className="text-sm text-gray-500">📞 {expert.phone}</p>
            <p className="text-sm text-gray-500">
              🎯 {expert.specialization || "Not available"}
            </p>
          </div>
        </div>

        {/* Bottom: Service Area Badge */}
        <div className="mt-4">
          <span
            className={`inline-block px-3 py-1 text-xs font-medium rounded-full 
              ${
                expert.serviceArea === "On-site"
                  ? "bg-green-100 text-green-800"
                  : expert.serviceArea === "Remote"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-purple-100 text-purple-800"
              }`}
          >
            Service Area: {expert.serviceArea}
          </span>
        </div>
      </div>
    ))
  ) : (
    <p className="text-center col-span-3 text-gray-500">No experts found.</p>
  )}
</div>
        )}
      </main>
    </div>
  );
};

export default Allexpert;
