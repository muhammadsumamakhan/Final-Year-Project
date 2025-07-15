import React, { useEffect, useState } from 'react';
import { auth, db } from '../../config/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import ExpertOrder from './ExpertOrder';
import ExpertProfile from './ExpertProfile';
import ExpertLoginActivity from './ExpertLoginActivity'
import ExpertTest from './ExpertTest';

const ExpertPortal = () => {
  const [expertData, setExpertData] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpertData = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, "FYPusers"),
          where("uid", "==", user.uid),
          where("role", "==", "expert")
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setExpertData(data);
        } else {
          console.log("No expert found or user is not an expert.");
          navigate('/');
        }
      }
    };

    fetchExpertData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">

      {/* Mobile Toggle Button */}
      <div className="md:hidden flex justify-between items-center bg-orange-600 text-white p-4">
        <h2 className="text-xl font-bold">Expert Portal</h2>
        <button
          onClick={toggleSidebar}
          className="text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`md:flex flex-col justify-between bg-orange-600 text-white p-4 w-full md:w-64 ${isSidebarOpen ? 'flex' : 'hidden'} md:block`}>
        <div>
          <h2 className="text-2xl font-bold mb-4 hidden md:block">Expert Portal</h2>

          <nav>
            <ul>
              <li className={`mb-4 hover:text-gray-200 cursor-pointer ${activeTab === 'dashboard' && 'font-bold underline'}`} onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }}>
                Dashboard
              </li>
              <li className={`mb-4 hover:text-gray-200 cursor-pointer ${activeTab === 'orders' && 'font-bold underline'}`} onClick={() => { setActiveTab("orders"); setIsSidebarOpen(false); }}>
                Orders
              </li>
              <li className={`mb-4 hover:text-gray-200 cursor-pointer ${activeTab === 'profile' && 'font-bold underline'}`} onClick={() => { setActiveTab("profile"); setIsSidebarOpen(false); }}>
                My Profile
              </li>
              <li className={`mb-4 hover:text-gray-200 cursor-pointer ${activeTab === 'Login Activity' && 'font-bold underline'}`} onClick={() => { setActiveTab("Login Activity"); setIsSidebarOpen(false); }}>
              Login Activity
              </li>
              <li className="mb-4 hover:text-gray-200 cursor-pointer" onClick={handleLogout}>
                Log Out
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-white overflow-auto">
        <header className="flex justify-between items-center border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "orders" && "Expert Orders"}
            {activeTab === "profile" && "My Profile"}
            {activeTab === "Login Activity" && "Login Activity"}
          </h1>
        </header>

        <section>
          {activeTab === "dashboard" && <p>Welcome to your expert dashboard.
           <div><ExpertTest /> </div>
            </p>}
          {activeTab === "orders" && <ExpertOrder />}
          {activeTab === "profile" && <ExpertProfile />}
          {activeTab === "Login Activity" && <ExpertLoginActivity />}
        </section>
      </main>
    </div>
  );
};

export default ExpertPortal;
