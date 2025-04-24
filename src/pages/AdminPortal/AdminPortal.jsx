import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; 

const StatCard = ({ title, count, description }) => (
    <div className="bg-white shadow-md p-6 rounded-lg text-center hover:scale-105 transition-transform">
        <h3 className="text-xl font-bold text-gray-700">{title}</h3>
        <p className="mt-2 text-2xl font-bold text-orange-500">{count}</p>
        <p className="text-gray-500">{description}</p>
    </div>
);

const AdminPortal = () => {
    const stats = [
        { title: "Users", count: 3, description: "Active Users" },
        { title: "Experts", count: 3, description: "Active Experts" },
        { title: "Experts Request", count: 3, description: "Active Experts Request" },
    ];

    const sidebarLinks = [
        { name: "Manage Users", path: "/admin-manage-users" },
        { name: "Manage Experts", path: "/admin-manage-experts" },
        { name: "Manage Experts Request", path: "/admin-manage-experts-request" },
    ];

    const [isSidebarOpen, setSidebarOpen] = useState(false);  
    const navigate = useNavigate();


    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);  
            } else {
                setSidebarOpen(false);  
            }
        };

        window.addEventListener("resize", handleResize);

        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header Section */}
            <header className="sticky top-0 z-10 w-full h-[70px] flex justify-between items-center bg-orange-500 border-b px-4 md:px-16 lg:px-[166px]">
                <h1 className="text-white text-2xl md:text-3xl font-bold">Admin Portal</h1>
                <button
                    className="block md:hidden p-2 bg-white text-orange-500 rounded"
                    onClick={() => setSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? (
                        <FaTimes size={24} /> 
                    ) : (
                        <FaBars size={24} /> 
                    )}
                </button>
            </header>

            <div className="flex flex-1">
                {/* Sidebar Section */}
                {isSidebarOpen && (
                    <aside className="w-full sm:w-1/4 bg-white shadow-lg p-6 fixed sm:relative z-20 sm:z-0 sm:translate-x-0 transition-transform transform">
                        <nav>
                            <ul className="space-y-4">
                                {sidebarLinks.map((link, index) => (
                                    <li key={index}>
                                        <NavLink
                                            to={link.path}
                                            className={({ isActive }) =>
                                                `text-lg ${
                                                    isActive
                                                        ? "text-orange-500 font-bold"
                                                        : "text-gray-700 hover:text-orange-500"
                                                }`
                                            }
                                        >
                                            {link.name}
                                        </NavLink>
                                    </li>
                                ))}
                                <li>
                                    <button onClick={() => navigate('/')} className="text-lg text-gray-700 hover:text-red-500">
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </aside>
                )}

                {/* Main Content Section */}
                <main className="flex-1 bg-gray-50 p-6 sm:ml-1/4">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Welcome, Admin!</h2>
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats.map((stat, index) => (
                            <StatCard
                                key={index}
                                title={stat.title}
                                count={stat.count}
                                description={stat.description}
                            />
                        ))}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default AdminPortal;
