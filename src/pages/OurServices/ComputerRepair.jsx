import React from "react";

const ComputerRepair = () => {
  return (
    <section className="bg-white min-h-screen py-10 px-4 sm:px-8 md:px-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-500 mb-6 border-b-2 border-orange-500 pb-2">
          Computer Repair
        </h1>

        <p className="text-gray-700 mb-4 leading-relaxed">
          Desktop computers remain popular in homes, offices, and gaming setups. Our Computer
          Repair service addresses a wide range of desktop issues — from hardware faults like
          faulty power supplies, RAM, hard drives, or graphics cards to software-related issues
          including slow performance, operating system errors, and malware infections.
        </p>

        <p className="text-gray-700 mb-4 leading-relaxed">
          We provide in-depth diagnostics, motherboard-level repairs, component replacement, and
          system optimization. Whether you’re facing a boot failure, screen freeze, or random
          shutdowns, we ensure quick and effective solutions.
        </p>

        <p className="text-gray-700 mb-4 leading-relaxed">
          Our certified team also assists with repairs and upgrades for custom-built PCs. This
          includes high-performance rigs used for gaming, graphic design, or professional
          workloads. We offer tailored advice for improving your system’s performance through
          hardware upgrades or software configuration.
        </p>

        <p className="text-gray-700 mb-4 leading-relaxed">
          Our approach combines technical expertise with transparency. You'll receive a clear
          diagnosis, upfront quote, and repair timeline. We use trusted, brand-name replacement
          parts to ensure quality and durability.
        </p>

        <h2 className="text-2xl font-semibold text-orange-500 mb-4">
          What We Offer:
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-800">
          <li>Power supply, motherboard, and graphics card replacement</li>
          <li>Hard drive/SSD upgrades and data migration</li>
          <li>Virus and malware removal</li>
          <li>OS installation and system optimization</li>
          <li>Fan cleaning and thermal management solutions</li>
          <li>Custom-built desktop diagnostics and repair</li>
        </ul>

        <p className="text-gray-700 mt-6 leading-relaxed">
          With <strong>Fix With Us</strong>, your desktop computer is in capable hands. Our goal
          is to minimize downtime and restore your system’s full functionality. Whether it’s for
          business or personal use, we deliver dependable repairs you can trust.
        </p>
      </div>
    </section>
  );
};

export default ComputerRepair;
