import React from 'react';

const OurTeam = () => {
    return (
        <section className="text-center py-20 pt-5 bg-white">
            <h1 className="text-lg text-[#f15523] font-semibold">MEMBER</h1>
            <p className="text-4xl font-bold mb-10 text-gray-900 mt-2 leading-tight">
                Our Team
            </p>
            <div className="flex flex-wrap justify-center gap-8">
                {/* Team Member 1 */}
                <div className="bg-gray-100 p-6 rounded-lg shadow-lg  max-w-[280px] text-center">
                    <img
                        src="https://i.ibb.co/FHnm7Xr/Profile.jpg"
                        alt="MSK"
                        className="w-full h-auto mb-4 rounded-lg"
                    />
                    <h2 className="text-xl text-[#0D003B] font-semibold  hover:text-orange-500 transition-all cursor-pointer">MUHAMMAD <br />SUMAMA <br />KHAN</h2>
                    <p className="text-gray-500">Founder</p>
                </div>

                {/* Team Member 2 */}
                <div className="bg-gray-100 p-6 rounded-lg shadow-lg max-w-[280px] text-center">
                    <img
                        src="https://i.ibb.co/yVJBYFG/businessman-character-avatar-isolated-24877-60111.jpg"
                        alt="MSK"
                        className="w-full h-auto mb-4 rounded-lg"
                    />
                    <h2 className="text-xl text-[#0D003B] font-semibold  hover:text-orange-500 transition-all cursor-pointer">ABDUL MUQEET</h2>
                    <p className="text-gray-500">Founder</p>
                </div>

                {/* Team Member 3 */}
                <div className="bg-gray-100 p-6 rounded-lg shadow-lg max-w-[280px] text-center">
                    <img
                        src="https://i.ibb.co/yVJBYFG/businessman-character-avatar-isolated-24877-60111.jpg"
                        alt="MSK"
                        className="w-full h-auto mb-4 rounded-lg"
                    />
                    <h2 className="text-xl text-[#0D003B] font-semibold  hover:text-orange-500 transition-all cursor-pointer">SHAHEER KAMRAN</h2>
                    <p className="text-gray-500">Founder</p>
                </div>

                {/* Team Member 4 */}
                <div className="bg-gray-100 p-6 rounded-lg shadow-lg max-w-[280px] text-center">
                    <img
                        src="https://i.ibb.co/yVJBYFG/businessman-character-avatar-isolated-24877-60111.jpg"
                        alt="MSK"
                        className="w-full h-auto mb-4 rounded-lg"
                    />
                    <h2 className="text-xl text-[#0D003B] font-semibold  hover:text-orange-500 transition-all cursor-pointer">HABIB JALISI</h2>
                    <p className="text-gray-500">Founder</p>
                </div>
            </div>
        </section>
    );
};

export default OurTeam;
