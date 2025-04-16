import React from 'react';

const Features = () => {
  const mainFeatures = [
    {
      title: "NUTRITION",
      description: "Eat a well balanced diet",
      link: "/food",
      image: "/images/Features/food02.jpg"
    },
    {
      title: "EXERCISE",
      description: "Stay active, Exercise regularly",
      link: "/exercise",
      image: "/images/Features/exercise01.jpg"
    },
    {
      title: "TALK",
      description: "Talk freely to someone",
      link: "/chatbot",
      image: "/images/Features/talk.jpg"
    },
    {
      title: "FUN HERE",
      description: "Do something that makes you happy",
      link: "/fun",
      image: "/images/Features/happy02.jpg"
    },
    {
      title: "DEAR DIARY",
      description: "This will help you keeping your thoughts at one place",
      link: "/diary",
      image: "/images/Features/diary.jpg"
    },
    {
      title: "MEDITATION",
      description: "Cultivate Joy Within: Meditate, Elevate, Radiate Happiness",
      link: "/meditation",
      image: "/images/Features/meditation.png"
    },
    {
      title: "VIDEOS",
      description: "Videos which will help you to calm your mind",
      link: "/videos",
      image: "/images/Features/video.jpg"
    },
    {
      title: "SONGS",
      description: "Nothing is better than listening to songs",
      link: "/songs",
      image: "/images/Features/song.jpg"
    },
    {
      title: "BOOKS",
      description: "Lost in the pages, found in the words",
      link: "/books",
      image: "/images/Features/books.png"
    },
    {
      title: "PLANNER",
      description: "Together We Plan, Together We Prosper!",
      link: "/planner",
      image: "/images/Features/planner.png"
    },
  ];

  const additionalWays = [
    { 
      name: "Enough Sleep", 
      image: "/images/Features/sleep.png" // Using the image from your screenshot
    },
    { 
      name: "Keep Hydrated", 
      image: "/images/Features/water-bottle.png" // Using the image from your screenshot
    },
    { 
      name: "Sunshine", 
      image: "/images/Features/sun.png" // Using the image from your screenshot
    },
    { 
      name: "Head Outside", 
      image: "/images/Features/park_01.png" // Using the image from your screenshot
    },
    { 
      name: "Laugh", 
      image: "/images/Features/laugh.png" // Using the image from your screenshot
    },
    { 
      name: "Gratitude", 
      image: "/images/Features/give-love.png" // Using the image from your screenshot
    },
    { 
      name: "Temptations", 
      image: "/images/Features/bad-habits.png" // Using the image from your screenshot
    },
  ];

  return (
    <div id='Features' className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold mb-8">
          HERE ARE SOME PROVEN WAYS TO LOOK AFTER YOUR 
          <span className="text-teal-400"> MENTAL HEALTH</span>.
        </h2>
      </div>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
        {mainFeatures.map((feature, index) => (
          <div 
            key={index} 
            className="relative h-72 overflow-hidden rounded-lg"
          >
            {/* Background Image with fallback */}
            <div className="absolute inset-0 w-full h-full bg-gray-800">
              <img 
                src={feature.image} 
                alt={feature.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Image failed to load:", feature.image);
                  e.target.style.display = 'none'; // Hide the broken image
                }}
              />
            </div>
            
            {/* Overlay - Using gradient instead of solid color */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,black,transparent_50%,transparent_50%,black)] flex flex-col justify-between p-4">
              {/* Title */}
              <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              
              {/* Description with learn more link */}
              <div className="mt-auto">
                <p className="text-sm text-white mb-2">{feature.description}</p>
                <a 
                  href={feature.link} 
                  className="text-sm text-teal-400 flex items-center hover:text-teal-300"
                >
                  Learn more
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Ways Section */}
      <div className="mb-8">
        <h3 className="text-xl font-medium mb-6 text-white border-b border-gray-700 pb-2">
          Some more ways...
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {additionalWays.map((way, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="bg-gray-800 rounded-full p-4 mb-2">
                <img 
                  src={way.image} 
                  alt={way.name} 
                  className="w-12 h-12"
                  onError={(e) => {
                    console.error("Icon failed to load:", way.image);
                    e.target.style.display = 'none'; // Hide the broken image
                  }}
                />
              </div>
              <p className="text-sm text-center">{way.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;