import React, { useEffect, useState } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase/config";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "FYPusers"),
      (snapshot) => {
        const fetchedUsers = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role === "user");
        setUsers(fetchedUsers);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.contact?.includes(searchTerm)
  );

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this user account?")) {
      try {
        await deleteDoc(doc(db, "FYPusers", id));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
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
          Manage Customers
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Search Bar */}
        <div>
          <div className="relative w-full sm:max-w-sm">
            <input
              type="text"
              placeholder="Search by name, email or contact..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto rounded-lg shadow bg-white">
          {loading ? (
            <div className="p-10 text-center text-orange-500 font-medium">Loading Customers...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-orange-500">No matching Customers found.</div>
          ) : (
            <table className="min-w-full text-sm text-gray-700 whitespace-nowrap">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Contact</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">CNIC</th>
                  <th className="px-6 py-3 text-left">Address</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <img
                        className="w-10 h-10 rounded-full object-cover"
                        src={
                          user.photoURL ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "")}`
                        }
                        alt="User"
                      />
                      <span className="font-medium text-gray-900">{user.fullName || "No Name"}</span>
                    </td>
                    <td className="px-6 py-4">{user.contact || "-"}</td>
                    <td className="px-6 py-4">{user.email || "-"}</td>
                    <td className="px-6 py-4">{user.cnic || "-"}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{user.address || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition"
                        title="Delete User"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-4">
          {loading ? (
            <div className="p-6 text-center text-orange-500 font-medium">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-orange-500">No matching users found.</div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="bg-white p-4 rounded-lg shadow space-y-2">
                <div className="flex items-center space-x-3">
                  <img
                    className="w-10 h-10 rounded-full object-cover"
                    src={
                      user.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "")}`
                    }
                    alt="User"
                  />
                  <span className="font-semibold text-gray-900">{user.fullName || "No Name"}</span>
                </div>
                <p><strong>Contact:</strong> {user.contact || "-"}</p>
                <p><strong>Email:</strong> {user.email || "-"}</p>
                <p><strong>CNIC:</strong> {user.cnic || "-"}</p>
                <p><strong>Address:</strong> {user.address || "-"}</p>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition"
                  title="Delete User"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageUsers;
