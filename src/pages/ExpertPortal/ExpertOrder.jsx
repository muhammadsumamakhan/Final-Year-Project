import React, { useState, useEffect } from "react";
import { db, auth } from "../../config/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ExpertOrder = () => {
  const [expertId, setExpertId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [userProfiles, setUserProfiles] = useState({}); // user profiles keyed by userId
  const [loading, setLoading] = useState(true);

  // Listen for auth state and get expertId
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setExpertId(user.uid);
      else {
        setExpertId(null);
        setBookings([]);
        setUserProfiles({});
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch bookings and user profiles when expertId changes
  useEffect(() => {
    if (!expertId) return;

    const fetchExpertBookings = async () => {
      setLoading(true);
      try {
        // Query bookings for this expert
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("expertId", "==", expertId)
        );
        const snapshot = await getDocs(bookingsQuery);
        const fetchedBookings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(fetchedBookings);

        // Get unique user IDs from bookings
        const uniqueUserIds = [
          ...new Set(fetchedBookings.map((b) => b.userId)),
        ];

        // Fetch user profiles from 'FYPusers'
        const userProfilePromises = uniqueUserIds.map(async (userId) => {
          const userDoc = await getDocs(
            query(collection(db, "FYPusers"), where("uid", "==", userId))
          );
          if (!userDoc.empty) {
            return { userId, data: userDoc.docs[0].data() };
          } else {
            return { userId, data: null };
          }
        });

        const profiles = await Promise.all(userProfilePromises);

        // Convert to object for quick access
        const profilesObj = {};
        profiles.forEach(({ userId, data }) => {
          profilesObj[userId] = data;
        });

        setUserProfiles(profilesObj);
      } catch (error) {
        console.error("Error fetching expert bookings or profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpertBookings();
  }, [expertId]);

  // Update booking status in Firestore and local state
  const updateBookingStatus = async (bookingId, status) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { status });
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  // Status badge component (for status display)
  const StatusBadge = ({ status }) => {
    let bgColor = "bg-gray-300 text-gray-800";
    if (status === "accepted") bgColor = "bg-green-100 text-green-800";
    else if (status === "rejected") bgColor = "bg-red-100 text-red-800";
    else if (status === "pending") bgColor = "bg-yellow-100 text-yellow-800";

    return (
      <span
        className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${bgColor}`}
      >
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending"}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 border-b pb-4 text-center">
        My Bookings as Expert
      </h1>

      {loading && (
        <p className="text-center text-gray-600 text-lg">Loading bookings...</p>
      )}

      {!loading && bookings.length === 0 && (
        <p className="text-center italic text-gray-500 text-lg">
          No bookings assigned to you yet.
        </p>
      )}

      {!loading && bookings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-indigo-600 text-white sticky top-0">
              <tr>
                <th className="p-3 text-left">Profile</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Address</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Status</th> {/* Status column */}
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const user = userProfiles[booking.userId];
                return (
                  <tr
                    key={booking.id}
                    className="border-b hover:bg-indigo-50 transition"
                  >
                    <td className="p-3 flex items-center space-x-3">
                      {user && user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.name || "User"}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                          N/A
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {booking.name || user?.name || "No Name"}
                        </p>
                        <p className="text-xs text-gray-500">{booking.userId}</p>
                      </div>
                    </td>
                    <td className="p-3 text-gray-700">{booking.date}</td>
                    <td className="p-3 text-gray-700">{booking.time}</td>
                    <td className="p-3 text-gray-700">{booking.address}</td>
                    <td className="p-3 text-gray-700">{booking.phone}</td>

                    {/* Status display */}
                    <td className="p-3">
                      <StatusBadge status={booking.status} />
                    </td>

                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => updateBookingStatus(booking.id, "accepted")}
                        disabled={booking.status === "accepted"}
                        className={`px-4 py-1 rounded-md font-semibold transition
                          ${
                            booking.status === "accepted"
                              ? "bg-green-300 cursor-not-allowed text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, "rejected")}
                        disabled={booking.status === "rejected"}
                        className={`px-4 py-1 rounded-md font-semibold transition
                          ${
                            booking.status === "rejected"
                              ? "bg-red-300 cursor-not-allowed text-white"
                              : "bg-red-600 hover:bg-red-700 text-white"
                          }`}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpertOrder;
