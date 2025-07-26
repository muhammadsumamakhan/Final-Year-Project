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
    try {
      await signOut(auth);
      setDropdownOpen(false);
      setMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
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
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="text-orange-500 text-2xl font-bold">
          <Link to="/">MSK</Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6 text-gray-700">
          <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-orange-500 transition-colors">About Us</Link>
          <Link to="/service" className="hover:text-orange-500 transition-colors">Service</Link>
          <Link to="/contact" className="hover:text-orange-500 transition-colors">Contact</Link>
        </div>

        {/* Desktop Authentication Actions */}
        <div className="hidden md:block relative" ref={dropdownRef}>
          {user ? (
            <div className="relative">
              <button
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                <img
                  src={user.photoURL || "https://via.placeholder.com/40"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-orange-500"
                />
                <span>{user.displayName || "User"}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                  {userRole === "expert" ? (
                    <>
                      <Link
                        to="/"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-orange-500 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Home
                      </Link>
                      <Link
                        to="/expertportal"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-orange-500 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </>
                  ) : userRole === "user" ? (
                    <>
                      <Link
                        to="/"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-orange-500 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Home
                      </Link>
                      <Link
                        to="/userportal"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-orange-500 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </>
                  ) : (
                    <div className="block px-4 py-2 text-gray-700">Loading role...</div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-orange-500 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link
                to="/userlogin"
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors shadow-md"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-orange-500 focus:outline-none"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="flex flex-col space-y-4 py-4 px-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-orange-500 transition-colors py-2 border-b border-gray-100"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-orange-500 transition-colors py-2 border-b border-gray-100"
              onClick={closeMobileMenu}
            >
              About Us
            </Link>
            <Link
              to="/service"
              className="text-gray-700 hover:text-orange-500 transition-colors py-2 border-b border-gray-100"
              onClick={closeMobileMenu}
            >
              Service
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-orange-500 transition-colors py-2 border-b border-gray-100"
              onClick={closeMobileMenu}
            >
              Contact
            </Link>

            {user ? (
              <div className="pt-2">
                <div className="flex items-center space-x-3 py-3 border-b border-gray-100">
                  <img
                    src={user.photoURL || "https://via.placeholder.com/40"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-orange-500"
                  />
                  <div>
                    <p className="font-medium text-gray-700">{user.displayName || "User"}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                {userRole === "expert" && (
                  <>
                    <Link
                      to="/"
                      className="block py-2 px-4 text-gray-700 hover:text-orange-500 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Home
                    </Link>
                    <Link
                      to="/expertportal"
                      className="block py-2 px-4 text-gray-700 hover:text-orange-500 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Dashboard
                    </Link>
                  </>
                )}
                {userRole === "user" && (
                  <>
                    <Link
                      to="/"
                      className="block py-2 px-4 text-gray-700 hover:text-orange-500 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Home
                    </Link>
                    <Link
                      to="/userportal"
                      className="block py-2 px-4 text-gray-700 hover:text-orange-500 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Dashboard
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 px-4 mt-2 text-gray-700 hover:text-orange-500 transition-colors border-t border-gray-100"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 pt-2">
                <Link
                  to="/userlogin"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-center shadow-md"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;