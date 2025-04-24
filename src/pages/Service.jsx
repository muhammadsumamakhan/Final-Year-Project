import React from 'react'

const Service = () => {
  return (
    <section className="py-12 bg-gray-100">
      <div className="max-w-6xl mx-auto pb-5 px-4">
     
        <div className="text-center mb-12">
          <h1 className="text-lg text-[#f15523] font-semibold">OUR SERVICES</h1>
          <p className="text-4xl font-bold text-gray-900 mt-2 leading-tight">
            Fast and Reliable Repairs for <br /> Every Need
          </p>
        </div>

       
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6  rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img
              src="https://wp.sthemeit.com/comx/wp-content/uploads/2024/04/hardware.jpg"
              alt="Hardware services"
              className="w-full h-48 object-cover rounded-lg"
            />
            <h2 className="text-xl font-semibold text-gray-900 mt-4">Hardware Services</h2>
            <p className="text-sm text-gray-600 mt-2">
              Our technicians are highly skilled and stay up-to-date with the latest technologies to provide you with the best solutions.
            </p>
            <button className="mt-4 px-6 py-2 bg-[#0D003B] text-white font-semibold rounded-lg shadow-lg hover:bg-orange-500 transition-all">
              Read More
            </button>
          </div>

          <div className="bg-white p-6  rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img
              src="https://wp.sthemeit.com/comx/wp-content/uploads/2024/04/software.jpg"
              alt="Software services"
              className="w-full h-48 object-cover rounded-lg"
            />
            <h2 className="text-xl font-semibold text-gray-900 mt-4">Software Services</h2>
            <p className="text-sm text-gray-600 mt-2">
              Our technicians are highly skilled and stay up-to-date with the latest technologies to provide you with the best solutions.
            </p>
            <button className="mt-4 px-6 py-2 bg-[#0D003B] text-white font-semibold rounded-lg shadow-lg hover:bg-orange-500 transition-all">
              Read More
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img
              src="https://wp.sthemeit.com/comx/wp-content/uploads/2024/04/DATA-RECOVERY-AND-BACKUP-2-1.jpg"
              alt="Data recovery and backup"
              className="w-full h-48 object-cover rounded-lg"
            />
            <h2 className="text-xl font-semibold text-gray-900 mt-4">Data Recovery and Backup</h2>
            <p className="text-sm text-gray-600 mt-2">
              Our technicians are highly skilled and stay up-to-date with the latest technologies to provide you with the best solutions.
            </p>
            <button className="mt-4 px-6 py-2 bg-[#0D003B] text-white font-semibold rounded-lg shadow-lg hover:bg-orange-500 transition-all">
              Read More
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Service
