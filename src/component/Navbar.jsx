import { query, where, getDocs, collection } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../config/firebase/config";
import { db } from "../config/firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log("Current User UID:", currentUser.uid);

        try {
          const q = query(collection(db, "FYPusers"), where("uid", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0]; // Get the first matching document
            const data = docSnap.data();
            console.log("Fetched user data:", data);

            if (data.role === "expert" || data.role === "user") {
              setUserRole(data.role);
              console.log(data.role);

            } else {
              console.warn("Role not defined correctly in Firestore.");
              setUserRole(null);
            }
          } else {
            console.warn("No document found in FYPusers with UID:", currentUser.uid);
            setUserRole(null);
          }

        } catch (error) {
          console.error("Error fetching role from Firestore:", error);
        }

      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when a link is clicked
  const closeMobileMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="text-orange-500 text-2xl font-bold">
          <Link to="/">MSK</Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6 text-gray-700">
          <Link to="/" className="hover:text-orange-500">Home</Link>
          <Link to="/about" className="hover:text-orange-500">About Us</Link>
          <Link to="/service" className="hover:text-orange-500">Service</Link>
          <Link to="/contact" className="hover:text-orange-500">Contact</Link>
        </div>

        {/* Authentication Actions */}
        <div className="hidden md:block relative" ref={dropdownRef}>
          {user ? (
            <div className="relative">
              <button
                className="flex items-center space-x-2 text-gray-700"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <img
                  src={user.photoURL || "https://via.placeholder.com/40"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <span>{user.displayName || "User"}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md">
                  {userRole === "expert" ? (
                    <Link
                      to="/expertportal"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : userRole === "user" ? (
                    <>
                      <Link
                        to="/userportal"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>


                    </>
                  ) : (
                    <div className="block px-4 py-2 text-gray-700">Unauthorized</div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/userlogin"
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-all"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-orange-500 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="flex flex-col space-y-4 py-4 px-6">
            <Link to="/" className="hover:text-orange-500" onClick={closeMobileMenu}>Home</Link>
            <Link to="/about" className="hover:text-orange-500" onClick={closeMobileMenu}>About Us</Link>
            <Link to="/service" className="hover:text-orange-500" onClick={closeMobileMenu}>Service</Link>
            <Link to="/contact" className="hover:text-orange-500" onClick={closeMobileMenu}>Contact</Link>

            {user ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 text-gray-700"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <img
                    src={user.photoURL || "https://via.placeholder.com/40"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{user.displayName || "User"}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md">
                    {userRole === "expert" ? (
                      <Link
                        to="/expertportal"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        Expert Portal
                      </Link>
                    ) : userRole === "user" ? (
                      <Link
                        to="/userportal"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setDropdownOpen(false);
                          closeMobileMenu();
                        }}
                      >
                        User Portal
                      </Link>
                    ) : (
                      <div className="block px-4 py-2 text-gray-700">Unauthorized</div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/userlogin"
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-all"
                onClick={closeMobileMenu}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
