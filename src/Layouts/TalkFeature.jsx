import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TalkFeature() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
 


  return (
    <div className=' text-[#1a1a1a] font-sans min-h-[60vh] mt-10 mb-10'>
    <div className="border border-teal-500 rounded-lg p-1 bg-gray-100 m-4 mt-10">
    <div className="border border-teal-500 rounded-lg p-8 pt-20 pb-20 bg-gray-100 ">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="md:w-2/3 pr-4">
          <h2 className="text-4xl font-bold mb-4">Talk.</h2>
          <p className="mb-4 text-gray-700">
            As above mentioned talking to someone about your feeling really help to reduce depression and heal you.
          </p>
          <p className="mb-8 text-gray-700">
            Talking can be a way to cope with a problem you've been carrying around in your head for a while. Just being
            listened to can help you feel supported and less alone. And it works both ways. If you open up, it might
            encourage others to do the same.
          </p>
          
          <h2 className="text-3xl font-bold mb-4">Chat Bot</h2>
          <p className="mb-4  text-gray-700">
            If you feel sad today incase you need someone to talk about what you've been through, here you go
          </p>
          
          <button 
      className={`text-teal-500 font-medium flex items-center transition-all duration-300 ${isHovered ? 'gap-3' : 'gap-2'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate('/chatbot')}
    >
      Take me there 
      <ArrowRight size={20} className={`transition-all duration-300 ${isHovered ? 'transform translate-x-1' : ''}`} />
    </button>
        </div>
        
        <div className="md:w-1/3 mt-6 md:mt-0 flex items-center justify-center">
          <img 
            src="/images/TalkFeature/home-bot-img.png" 
            alt="Person talking to a chatbot" 
            className="max-w-full h-auto"
          />
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}