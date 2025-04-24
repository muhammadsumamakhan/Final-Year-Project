import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#0D003B] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#home"
                  className="hover:text-orange-500 transition-all"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="hover:text-orange-500 transition-all"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="hover:text-orange-500 transition-all"
                >
                  Service
                </a>
              </li>
              <li>
                <a
                  href="#blogs"
                  className="hover:text-orange-500 transition-all"
                >
                  Our Blogs
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-orange-500 transition-all"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#laptop-repair"
                  className="hover:text-orange-500 transition-all"
                >
                  Laptop Repair
                </a>
              </li>
              <li>
                <a
                  href="#computer-repair"
                  className="hover:text-orange-500 transition-all"
                >
                  Computer Repair
                </a>
              </li>
              <li>
                <a
                  href="#apple-repair"
                  className="hover:text-orange-500 transition-all"
                >
                  Apple Product Repair
                </a>
              </li>
              <li>
                <a
                  href="#data-recovery"
                  className="hover:text-orange-500 transition-all"
                >
                  Data Recovery
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li>
                <p>
                SSUET, Karachi
                </p>
              </li>
              <li>
                <p>
                  <span className="text-orange-500 mr-2">⏰</span> Opening Hours: 10.00 AM - 4.00 PM
                </p>
              </li>
              <li>
                <p>
                  <span className="text-orange-500 mr-2">📞</span> Phone Call: +123 456 7890
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center">
          <p>
            © MSK. All Rights Reserved by{" "}
            <a
              href="#"
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
