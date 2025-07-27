import React from "react";

const ReturnRefundPolicy = () => {
  return (
    <section className="bg-white min-h-screen py-10 px-4 sm:px-8 md:px-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-500 mb-6 border-b-2 border-orange-500 pb-2">
          Return & Refund Policy
        </h1>

        <p className="text-gray-700 mb-4 leading-relaxed">
          The Return and Refund Policy informs customers of the terms under which they can return a
          product or request a refund. This is especially important for e-commerce websites or
          service-based platforms.
        </p>

        <p className="text-gray-700 mb-4 leading-relaxed">
          Your policy should cover:
        </p>

        <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-800">
          <li><strong>Eligibility:</strong> What products or services are eligible for return?</li>
          <li><strong>Time Frame:</strong> How many days do customers have to request a return or refund (e.g., within 7 or 14 days)?</li>
          <li><strong>Condition:</strong> Must the product be unused, in original packaging, or in a certain condition?</li>
          <li><strong>Process:</strong> How to request a return—should the customer contact support, fill out a form, or return to a location?</li>
          <li><strong>Refund Method:</strong> Will refunds be given via original payment method, store credit, or replacement?</li>
        </ul>

        <p className="text-gray-700 mb-6 leading-relaxed">
          Having a clear Return/Refund Policy improves customer confidence and reduces disputes.
        </p>

        <h2 className="text-2xl font-semibold text-orange-500 mb-4">Our Policy</h2>

        <p className="text-gray-700 mb-4 leading-relaxed">
          Our services include both digital and physical offerings. As such, return and refund
          requests are handled on a case-by-case basis to ensure fairness and service quality.
        </p>

        <p className="text-gray-700 mb-4 leading-relaxed">
          If you're not satisfied with a service, please contact us within <strong>3 days</strong>{" "}
          of the completed service. We will assess the issue and determine if a refund, replacement,
          or re-service is appropriate.
        </p>

        <p className="text-gray-700 leading-relaxed">
          For physical products, items must be returned in their original condition and packaging.
          Refunds will be processed using the original payment method or via store credit,
          depending on the situation.
        </p>
      </div>
    </section>
  );
};

export default ReturnRefundPolicy;
