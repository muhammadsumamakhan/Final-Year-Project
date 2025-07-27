import React from "react";

const PrivacyPolicy = () => {
  return (
    <section className="bg-white min-h-screen py-10 px-4 sm:px-8 md:px-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-500 mb-6 border-b-2 border-orange-500 pb-2">
          Privacy Policy
        </h1>

        <p className="text-gray-700 mb-4 leading-relaxed">
          A Privacy Policy is a legal document that outlines how a website or business collects,
          uses, stores, and protects customers’ personal information. Personal data may include
          names, emails, phone numbers, addresses, payment details, or any other information a
          customer submits. This policy is crucial for building trust and is often required by
          law, especially if your website collects customer data or uses third-party tools like
          Google Analytics, payment gateways, or forms.
        </p>

        <p className="text-gray-700 mb-4 leading-relaxed">
          In your Privacy Policy, you should clearly state:
        </p>

        <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-800">
          <li>What information is collected (e.g., via forms, cookies, or third-party services)</li>
          <li>How the information is used (e.g., for customer service, order fulfillment, marketing)</li>
          <li>How it is protected (e.g., encryption, secure servers)</li>
          <li>If and when it is shared with third parties (like shipping providers or payment processors)</li>
          <li>The customer’s rights (such as requesting data deletion or opting out of marketing)</li>
        </ul>

        <p className="text-gray-700 mb-6 leading-relaxed">
          This policy assures customers that their data is handled responsibly and securely.
        </p>

        <h2 className="text-2xl font-semibold text-orange-500 mb-4">Our Commitment</h2>

        <p className="text-gray-700 mb-4 leading-relaxed">
          At <strong>Fix With Us</strong>, we value your privacy. All information collected (such
          as name, email, and contact number) is used only for service and support purposes. We
          never share your data with third parties without your consent.
        </p>

        <p className="text-gray-700 mb-4 leading-relaxed">
          We implement industry-standard security measures, such as encryption and secure servers,
          to protect your data. Customers have the right to access, correct, or delete their
          personal data at any time by contacting our support team.
        </p>

        <p className="text-gray-700 leading-relaxed">
          By using our platform, you agree to the practices outlined in this Privacy Policy. If you
          have any concerns, feel free to reach out to our customer support team.
        </p>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
