import React from "react";

const ShippingPolicy = () => {
  return (
    <section className="bg-white min-h-screen py-10 px-4 sm:px-8 md:px-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-500 mb-6 border-b-2 border-orange-500 pb-2">
          Shipping / Service Policy
        </h1>

        <p className="text-gray-700 mb-4 leading-relaxed">
          The Shipping or Service Policy outlines how your products or services are delivered to the customer. This includes timeframes, delivery methods, geographic limitations, and possible shipping fees.
        </p>

        <h2 className="text-2xl font-semibold text-orange-500 mb-4">Key Areas We Cover</h2>

        <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-800">
          <li>
            <strong>Delivery Time:</strong> Online consultations are scheduled within 24 hours of request. Physical repair services are arranged based on expert availability in the customer's city, usually within 2–3 business days.
          </li>
          <li>
            <strong>Shipping Charges:</strong> No additional shipping charges apply unless specified in the invoice. Any extra charges will be communicated before finalizing the service.
          </li>
          <li>
            <strong>Service Availability:</strong> We provide both remote (online) and doorstep (physical) services. Availability depends on location and expert schedules.
          </li>
          <li>
            <strong>Tracking Information:</strong> Customers receive timely updates via SMS or email regarding appointment status and service progress. For shipped parts, tracking numbers will be shared.
          </li>
          <li>
            <strong>Damaged or Lost Items:</strong> In the unlikely event of a lost or damaged product, customers are encouraged to contact our support team within 48 hours for a resolution or replacement.
          </li>
        </ul>

        <p className="text-gray-700 leading-relaxed">
          This policy helps set clear expectations and ensures that our customers understand how and when their requested services or items will be delivered. If you have any questions or concerns about your delivery or service, please contact our customer support team for assistance.
        </p>
      </div>
    </section>
  );
};

export default ShippingPolicy;
