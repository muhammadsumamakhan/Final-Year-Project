import React from "react";

const Contact = () => {
  return (
    <section className="bg-gray-100 py-10 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-lg text-[#f15523] font-semibold uppercase">
            Contact Us
          </h1>
          <p className="text-4xl font-bold text-gray-900 mt-2 leading-tight">
            Feel Free to Write Us Anytime
          </p>
        </div>

        {/* Form and Contact Details */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:max-w-md md:max-w-lg lg:max-w-4xl mx-auto">
          <form className="space-y-4 w-full">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Your Name"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Your Email"
              required
            />
            <input
              type="text"
              placeholder="Subject"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Subject"
            />
            <textarea
              placeholder="Your Message"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="5"
              aria-label="Your Message"
              required
            ></textarea>
            <button
              type="submit"
              className="w-full bg-[#0D003B] text-white font-semibold py-2 rounded-md hover:bg-orange-500 transition-all"
            >
              Submit Now
            </button>
          </form>

          {/* Contact Information */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-[#0D003B] mb-6">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Address */}
              <div className="flex items-center">
                <div className="text-orange-500 text-3xl mr-4">📍</div>
                <div>
                  <p className="text-gray-600">Visit Anytime</p>
                  <h1 className="font-semibold text-[#0D003B]">SSUET, Karachi</h1>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center">
                <div className="text-orange-500 text-3xl mr-4">📞</div>
                <div>
                  <p className="text-gray-600">Call Us</p>
                  <h1 className="font-semibold text-[#0D003B]">+92 123 456 789</h1>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center">
                <div className="text-orange-500 text-3xl mr-4">📧</div>
                <div>
                  <p className="text-gray-600">Email Us</p>
                  <h1 className="font-semibold text-[#0D003B]">info@ssuet.com</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
