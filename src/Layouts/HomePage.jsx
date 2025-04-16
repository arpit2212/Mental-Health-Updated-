import React from 'react';

const HomePage = () => {
  return (
    <div className="bg-[#dce1e3] text-[#1a1a1a] font-sans min-h-[90vh]">
      <main className="flex flex-col lg:flex-row justify-between items-center px-4 sm:px-8 md:px-12 lg:px-20 py-10 gap-10 h-full">
        
        {/* TEXT CONTENT */}
        <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left flex flex-col justify-center h-full">
          <h2 className="text-5xl sm:text-5xl lg:text-6xl font-black">
            Mental <span className="font-light">Health</span>
          </h2>
          <p className="text-base sm:text-lg">
            Take your time <span className="text-teal-600 font-semibold">healing</span>, as long as you want.
            Nobody else knows what you’ve been through. How could they know how long it will take to heal you?
          </p>
          <p className="text-sm sm:text-base mt-10">
            This place is dedicated to helping you free yourself from unwanted thoughts and strengthen your mental health.
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
          <a href="#Features">
  <button className="bg-gray-900 text-white px-6 py-2 rounded shadow-md hover:bg-gray-700 w-full sm:w-auto">
    Explore
  </button>
</a>

            
            
          </div>
        </div>

        {/* Illustration */}
        <div className="w-full lg:w-1/2 flex justify-center items-center h-full">
          <img
            src="../../src/assets/images/HomePage/cominedilus.png"
            alt="Illustration"
            className="w-[300px] sm:w-[300px] md:w-[350px] lg:w-[500px] lg:ml-28 h-auto object-contain"
          />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
