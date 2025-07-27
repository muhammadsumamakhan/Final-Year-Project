import React from "react";

const TermsAndConditions = () => {
  return (
    <section className="bg-white min-h-screen py-10 px-4 sm:px-8 md:px-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-500 mb-6 border-b-2 border-orange-500 pb-2">
          Terms & Conditions
        </h1>

        <p className="text-gray-700 mb-4 leading-relaxed">
          The Terms & Conditions (T&C) outline the rules customers must agree to in order to use our website or service. It’s a legal agreement between you and Fix With Us that protects both parties and ensures a safe, fair experience.
        </p>

        <p className="text-gray-700 mb-4 leading-relaxed">
          By using Fix With Us, you agree to our service terms. We provide a platform to connect customers with experts but are not liable for expert behavior outside of the platform. Always verify expert identity before handing over any device or personal items.
        </p>

        <p className="text-gray-700 mb-4 leading-relaxed">
          Misuse of the platform, including fraudulent activity, harassment, or illegal actions, may result in immediate account suspension or termination. We reserve the right to update these terms at any time without prior notice.
        </p>

        <h2 className="text-2xl font-semibold text-orange-500 mt-8 mb-4">Key Terms You Agree To</h2>

        <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-800">
          <li>Customer responsibilities (e.g., not using the service for illegal activities)</li>
          <li>Payment terms and subscription models</li>
          <li>Intellectual property rights (Fix With Us retains ownership of platform content)</li>
          <li>Account termination policies for violating rules</li>
          <li>Disclaimers and limitations of liability</li>
          <li>Governing law (Indian law governs this agreement)</li>
        </ul>

        <p className="text-gray-700 mb-4 leading-relaxed">
          You are responsible for maintaining the confidentiality of your account and password. Any activity under your login credentials is considered your responsibility. You agree not to reproduce, duplicate, copy, sell, or exploit any part of the service.
        </p>

        <p className="text-gray-700 mb-4 leading-relaxed">
          We strive to ensure accurate service listings and expert availability, but we do not guarantee uninterrupted or error-free operation. In no event shall Fix With Us be liable for indirect, incidental, or consequential damages.
        </p>

        <p className="text-gray-700 leading-relaxed">
          By continuing to use our services, you acknowledge that you’ve read, understood, and agreed to our Terms & Conditions. If you have questions, please contact our support team.
        </p>
      </div>
    </section>
  );
};

export default TermsAndConditions;
