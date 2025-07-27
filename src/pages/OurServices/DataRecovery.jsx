import React from "react";

const DataRecovery = () => {
  return (
    <section className="bg-white min-h-screen py-10 px-4 sm:px-8 md:px-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-500 mb-6 border-b-2 border-orange-500 pb-2">
          Data Recovery
        </h1>

        <p className="text-gray-700 mb-4 leading-relaxed">
          Accidental file deletion, formatting, hardware failure, or virus attacks can lead to
          critical data loss. Our Data Recovery service is here to retrieve lost or inaccessible
          data from laptops, desktops, hard drives, SSDs, USB drives, memory cards, and more.
        </p>

        <p className="text-gray-700 mb-4 leading-relaxed">
          We use advanced recovery tools and methods to safely extract your files, including
          documents, photos, videos, and system backups. Whether it's a corrupted drive or
          physical damage, our specialists assess the situation and advise on the best recovery
          process suited to your case.
        </p>

        <h2 className="text-2xl font-semibold text-orange-500 mb-4">What We Recover</h2>

        <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-800">
          <li>Deleted files and folders</li>
          <li>Formatted partitions and drives</li>
          <li>Corrupted hard drives and SSDs</li>
          <li>USB flash drives and SD card data</li>
          <li>Virus-infected or damaged files</li>
          <li>Accidentally lost system or backup data</li>
        </ul>

        <p className="text-gray-700 mb-4 leading-relaxed">
          Our clean-room environments and specialized software enable us to recover data even from
          physically damaged storage devices. We work with all file systems including NTFS, FAT32,
          APFS, and HFS+.
        </p>

        <h2 className="text-2xl font-semibold text-orange-500 mb-4">Your Data Is Safe</h2>

        <p className="text-gray-700 mb-4 leading-relaxed">
          We prioritize your privacy and confidentiality. All data recovery procedures are handled
          only by authorized technicians, and your information is never shared or stored without
          your consent.
        </p>

        <p className="text-gray-700 leading-relaxed">
          In many cases, we’re able to recover up to <strong>100%</strong> of lost data. If you're
          facing data loss due to accidental deletion, device failure, or corruption, <strong>Fix
          With Us</strong> is ready to help recover your valuable files quickly and securely.
        </p>
      </div>
    </section>
  );
};

export default DataRecovery;
