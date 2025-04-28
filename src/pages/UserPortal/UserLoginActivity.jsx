import React, { useEffect, useState } from "react";
import { db, auth } from "../../config/firebase/config";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const UserLoginActivity = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;
    
    // Check if user is logged in
    unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "logs"),
            where("uid", "==", user.uid),
            orderBy("date", "desc")
          );

          const querySnapshot = await getDocs(q);
          const fetchedLogs = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setLogs(fetchedLogs);
        } catch (error) {
          console.error("Error fetching logs:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">No login activity found. Please log in to view your activity.</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <header className="w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 sm:px-6 md:px-16 lg:px-[166px]">
        <h1 className="text-white text-2xl md:text-3xl font-bold">Login Activity</h1>
      </header>

      <div className="overflow-x-auto mt-8">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-[166px]">
          <table className="min-w-full bg-white shadow-md mb-9 rounded-lg overflow-hidden">
            <thead className="bg-[#0D003B] text-white">
              <tr>
                <th className="py-3 px-6 text-left" scope="col">Status</th>
                <th className="py-3 px-6 text-left" scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="py-3 px-6 capitalize">{log.loginStatus}</td>
                  <td className="py-3 px-6">
                    {log.date?.toDate().toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserLoginActivity;
