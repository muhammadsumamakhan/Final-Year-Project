import React, { useEffect, useState } from 'react';
import { auth, db } from '../../config/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import UserBookingActivity from './UserBookingActivity';
import UserProfile from './UserProfile';
import UserLoginActivity from './UserLoginActivity';


const UserPortal = () => {
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                const q = query(
                    collection(db, "FYPusers"),
                    where("uid", "==", user.uid),
                    where("role", "==", "user")
                );

                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const data = querySnapshot.docs[0].data();
                    setUserData(data);
                } else {
                    console.log("No user found or user is not a standard user.");
                    navigate('/');
                }
            }
        };

        fetchUserData();
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
            <div className="md:hidden flex justify-between items-center bg-orange-500 text-white p-4">
                <h2 className="text-xl font-bold">Customer Portal</h2>
                <button onClick={toggleSidebar} className="text-2xl focus:outline-none">☰</button>
            </div>

            {/* Sidebar */}
            <aside className={`md:flex flex-col justify-between bg-orange-500 text-white p-4 w-full md:w-64 ${isSidebarOpen ? 'flex' : 'hidden'} md:block`}>
                <div>
                    <h2 className="text-2xl font-bold mb-4 hidden md:block">Customer Portal</h2>

                    <nav>
                        <ul>
                            <li className={`mb-4 hover:text-gray-200 cursor-pointer ${activeTab === 'dashboard' && 'font-bold underline'}`} onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }}>
                                Dashboard
                            </li>
                            <li className={`mb-4 hover:text-gray-200 cursor-pointer ${activeTab === 'Booking Activity' && 'font-bold underline'}`} onClick={() => { setActiveTab("Booking Activity"); setIsSidebarOpen(false); }}>
                                Booking Activity
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
                        {activeTab === "Booking Activity" && "Booking Activity"}
                        {activeTab === "profile" && "My Profile"}
                        {activeTab === "Login Activity" && "Login Activity"}
                    </h1>
                </header>

                <section>
                    {activeTab === "dashboard" && (
                        <div className="py-16 px-6 md:px-16 lg:px-32 bg-gray-50">
                            <main className="flex flex-col md:flex-row justify-center items-center gap-8">
                                {/* Section: Know the issue */}
                                <section className="max-w-md w-full bg-gradient-to-br from-white to-gray-100 border border-gray-200 rounded-2xl shadow-lg p-8 md:p-12 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02]">
                                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3 min-h-[2.75rem]">
                                        If you know the issue
                                    </h2>
                                    <p className="text-gray-600 text-base md:text-lg mb-6 min-h-[4.5rem]">
                                        Provide details about the issue to proceed.
                                    </p>
                                    <button
                                        onClick={() => navigate('/userservice')}
                                        className="px-8 py-3 bg-[#0D003B] text-white rounded-xl font-semibold shadow-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    >
                                        Next
                                    </button>
                                </section>

                                {/* Section: Don’t know the issue */}
                                <section className="max-w-md w-full bg-gradient-to-br from-white to-gray-100 border border-gray-200 rounded-2xl shadow-lg p-8 md:p-12 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02]">
                                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3 min-h-[2.75rem]">
                                        If you don’t know the issue
                                    </h2>
                                    <p className="text-gray-600 text-base md:text-lg mb-6 min-h-[4.5rem]">
                                        Get assistance to diagnose the issue.
                                    </p>
                                    <button
                                        onClick={() => navigate('/allexpert')}
                                        className="px-8 py-3 bg-[#0D003B] text-white rounded-xl font-semibold shadow-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    >
                                        Next
                                    </button>
                                </section>
                            </main>
                        </div>

                    )}
                    {activeTab === "Booking Activity" && <UserBookingActivity />}
                    {activeTab === "profile" && <UserProfile />}
                    {activeTab === "Login Activity" && <UserLoginActivity />}
                </section>
            </main>
        </div>
    );
};

export default UserPortal;































