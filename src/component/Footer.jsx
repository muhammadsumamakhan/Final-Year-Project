import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#0D003B] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4">About Us</h2>
            <p className="text-sm">
              Fix With Us is a peer-to-peer computer repair service platform that
              connects customers with verified tech experts. We ensure fast and
              secure repairs, both online and offline.
            </p>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/laptop-repair" className="hover:text-orange-500 transition-all">
                  Laptop Repair
                </Link>
              </li>
              <li>
                <Link to="/computer-repair" className="hover:text-orange-500 transition-all">
                  Computer Repair
                </Link>
              </li>
              <li>
                <Link to="/apple-repair" className="hover:text-orange-500 transition-all">
                  Apple Product Repair
                </Link>
              </li>
              <li>
                <Link to="/data-recovery" className="hover:text-orange-500 transition-all">
                  Data Recovery
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Policies</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="hover:text-orange-500 transition-all">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/return-refund-policy" className="hover:text-orange-500 transition-all">
                  Return/Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-orange-500 transition-all">
                  Shipping/Service Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-orange-500 transition-all">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li><p>SSUET, Karachi</p></li>
              <li><p><span className="text-orange-500 mr-2">⏰</span>Opening Hours: 10.00 AM - 4.00 PM</p></li>
              <li><p><span className="text-orange-500 mr-2">📞</span>Phone Call: +123 456 7890</p></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center">
          <p className="text-center text-sm text-gray-400">
            © MSK. All Rights Reserved by{" "}
            <a
              href="https://sumama-portfolio-theta.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline"
            >
              MUHAMMAD SUMAMA KHAN
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
