import { useState } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { getVideoRecommendations } from '../services/videoService';

export default function Videos() {
  const [step, setStep] = useState('initial');
  const [selectedMood, setSelectedMood] = useState('');
  const [customMood, setCustomMood] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isCustomMood, setIsCustomMood] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const moods = [
    { id: 'anxious', label: 'Anxious', color: 'bg-blue-100' },
    { id: 'sad', label: 'Sad', color: 'bg-indigo-100' },
    { id: 'stressed', label: 'Stressed', color: 'bg-green-100' },
    { id: 'unmotivated', label: 'Unmotivated', color: 'bg-yellow-100' },
    { id: 'overwhelmed', label: 'Overwhelmed', color: 'bg-red-100' },
    { id: 'custom', label: 'Something else...', color: 'bg-purple-100' }
  ];

  // Updated predefined recommendations to include URLs
  const videoRecommendations = {
    anxious: [
      { title: "10-Minute Meditation for Anxiety", creator: "Headspace", description: "Guided meditation specifically designed to calm anxious thoughts", url: "https://www.youtube.com/watch?v=O-6f5wQXSu8" },
      { title: "Calming Nature Scenes: Forest Waterfall", creator: "Nature Therapy", description: "Soothing natural scenery with gentle ambient sounds", url: "https://www.youtube.com/watch?v=d0tU18Ybcvk" },
      { title: "Breathing Techniques for Anxiety Relief", creator: "Therapy in a Nutshell", description: "Simple breathing exercises to manage anxiety in the moment", url: "https://www.youtube.com/watch?v=vXZ5l7G6T2I" },
      { title: "Gentle Yoga for Stress & Anxiety", creator: "Yoga with Adriene", description: "Easy yoga poses to release tension and calm the nervous system", url: "https://www.youtube.com/watch?v=hJbRpHZr_d0" },
      { title: "The Science of Anxiety and How to Manage It", creator: "TED-Ed", description: "Understanding anxiety and evidence-based coping strategies", url: "https://www.youtube.com/watch?v=ZidGozDhOjg" }
    ],
    sad: [
      { title: "Heartwarming Animal Friendships", creator: "The Dodo", description: "Uplifting compilation of unlikely animal companions", url: "https://www.youtube.com/watch?v=mZw-1BfHFKM" },
      { title: "Comedy Special Highlights", creator: "Netflix Comedy", description: "Laugh-out-loud moments from top stand-up comedians", url: "https://www.youtube.com/watch?v=Vu8KjICLKxw" },
      { title: "People Being Awesome: Acts of Kindness", creator: "ViralHog", description: "Compilation of people helping others and spreading joy", url: "https://www.youtube.com/watch?v=uaWA2GbcnJU" },
      { title: "Beautiful Sunrise Time-lapse", creator: "National Geographic", description: "Stunning dawn scenes from around the world", url: "https://www.youtube.com/watch?v=v_Vnrr9V8hI" },
      { title: "Inspiring Stories of Overcoming Adversity", creator: "Goalcast", description: "Real-life stories that offer hope and perspective", url: "https://www.youtube.com/watch?v=kZIrIQDf1nQ" }
    ],
    stressed: [
      { title: "30-Minute Stress Relief Soundscape", creator: "Calm", description: "Ambient music designed to lower cortisol levels", url: "https://www.youtube.com/watch?v=lFcSrYw-ARY" },
      { title: "Progressive Muscle Relaxation Guide", creator: "Therapy in a Nutshell", description: "Step-by-step technique to release physical tension", url: "https://www.youtube.com/watch?v=1nZEdqcGVzo" },
      { title: "Satisfying Art and Craft Processes", creator: "ArtFusion", description: "Mesmerizing creative processes that captivate your attention", url: "https://www.youtube.com/watch?v=4KigFRmr8qM" },
      { title: "Underwater Coral Reef Journey", creator: "BBC Earth", description: "Peaceful exploration of vibrant marine ecosystems", url: "https://www.youtube.com/watch?v=F-Ft8z3O4aM" },
      { title: "Simple Desk Stretches for Stress Relief", creator: "FitnessBlender", description: "Quick stretches to release tension while working", url: "https://www.youtube.com/watch?v=tAUf7aajBWE" }
    ],
    unmotivated: [
      { title: "5-Minute Productivity Hack", creator: "Thomas Frank", description: "Quick technique to overcome procrastination", url: "https://www.youtube.com/watch?v=3QetfnYgjRE" },
      { title: "How Great Leaders Inspire Action", creator: "TED Talks", description: "Simon Sinek's powerful talk on finding your 'why'", url: "https://www.youtube.com/watch?v=u4ZoJKF_VuA" },
      { title: "Morning Routine of Successful People", creator: "Matt D'Avella", description: "Practical habits that set up your day for success", url: "https://www.youtube.com/watch?v=XpKvs-apvOs" },
      { title: "The Science of Motivation", creator: "AsapSCIENCE", description: "Understanding what drives us and how to harness it", url: "https://www.youtube.com/watch?v=pZT-FZqfxZA" },
      { title: "Workout Motivation: Just Start", creator: "FitnessBlender", description: "Energizing compilation to get you moving", url: "https://www.youtube.com/watch?v=CEuvCw8-KLk" }
    ],
    overwhelmed: [
      { title: "How to Break Down Overwhelming Tasks", creator: "How to ADHD", description: "Practical strategies for making big tasks manageable", url: "https://www.youtube.com/watch?v=Uo08uS904Rg" },
      { title: "Minimalist Living: Simplify Your Life", creator: "Matt D'Avella", description: "Tips for reducing mental and physical clutter", url: "https://www.youtube.com/watch?v=w7rewjFNiys" },
      { title: "One Thing at a Time: Mindfulness Practice", creator: "Headspace", description: "Guided exercise for focusing on the present moment", url: "https://www.youtube.com/watch?v=ZToicYcHIOU" },
      { title: "The Power of Saying No", creator: "School of Life", description: "Setting boundaries when you have too much on your plate", url: "https://www.youtube.com/watch?v=uNh9uZsmPL4" },
      { title: "Gentle Evening Wind Down Routine", creator: "Yoga with Adriene", description: "Calming practices to transition from busy days", url: "https://www.youtube.com/watch?v=BiWDsfZ3zbo" }
    ]
  };

  // Default recommendations with URLs
  const defaultRecommendations = [
    { title: "Inspiring Moments in Human History", creator: "Timeline", description: "Collection of uplifting historical achievements", url: "https://www.youtube.com/watch?v=WXqT1qlp0_0" },
    { title: "Stunning Planet Earth Compilation", creator: "BBC Earth", description: "Breathtaking natural wonders from around the world", url: "https://www.youtube.com/watch?v=6v2L2UGZJAM" },
    { title: "Daily Mindfulness Practice", creator: "Headspace", description: "Centering exercise suitable for any emotional state", url: "https://www.youtube.com/watch?v=inpok4MKVLM" },
    { title: "Fascinating Facts You Never Knew", creator: "Veritasium", description: "Engaging explanations of surprising phenomena", url: "https://www.youtube.com/watch?v=5Tqt8-zv40o" },
    { title: "The Science of Happiness", creator: "TED-Ed", description: "Evidence-based insights on what truly makes us feel good", url: "https://www.youtube.com/watch?v=4q1dgn_C0AU" }
  ];

  // This function finds the closest matching mood from our defined list
  const findSimilarMood = (inputMood) => {
    // Simple matching for common emotions that might be expressed in different ways
    const moodMapping = {
      // Anxious group
      'nervous': 'anxious',
      'afraid': 'anxious',
      'fearful': 'anxious',
      'panic': 'anxious',
      'worried': 'anxious',
      'uneasy': 'anxious',
      
      // Sad group
      'unhappy': 'sad',
      'down': 'sad',
      'blue': 'sad',
      'depressed': 'sad',
      'gloomy': 'sad',
      'miserable': 'sad',
      
      // Stressed group
      'pressure': 'stressed',
      'busy': 'stressed',
      'tense': 'stressed',
      'exhausted': 'stressed',
      
      // Unmotivated group
      'lazy': 'unmotivated',
      'apathetic': 'unmotivated',
      'tired': 'unmotivated',
      'listless': 'unmotivated',
      
      // Overwhelmed group
      'swamped': 'overwhelmed',
      'overloaded': 'overwhelmed',
      'buried': 'overwhelmed',
      'underwater': 'overwhelmed',
      
      // Happy group (map to hopeful for positive videos)
      'happy': 'hopeful',
      'joyful': 'hopeful',
      'excited': 'hopeful',
      'content': 'hopeful'
    };
    
    return moodMapping[inputMood.toLowerCase()] || null;
  };

  const handleMoodSelect = async (mood) => {
    if (mood === 'custom') {
      setIsCustomMood(true);
      return;
    }
    
    setSelectedMood(mood);
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get recommendations from Gemini
      const aiRecommendations = await getVideoRecommendations(mood);
      
      if (aiRecommendations && aiRecommendations.length > 0) {
        // Add default URLs if Gemini doesn't provide them
        const processedRecommendations = aiRecommendations.map(rec => {
          if (!rec.url) {
            // Create a YouTube search URL as fallback
            const searchQuery = encodeURIComponent(`${rec.title} ${rec.creator}`);
            rec.url = `https://www.youtube.com/results?search_query=${searchQuery}`;
          }
          return rec;
        });
        setRecommendations(processedRecommendations);
      } else {
        // Fallback to our predefined recommendations
        setRecommendations(videoRecommendations[mood] || defaultRecommendations);
      }
    } catch (err) {
      setError("Couldn't connect to our recommendation service. Using our curated list instead.");
      // Fallback to our predefined recommendations
      setRecommendations(videoRecommendations[mood] || defaultRecommendations);
    } finally {
      setIsLoading(false);
      setStep('recommendations');
    }
  };

  const handleCustomMoodSubmit = async (e) => {
    e.preventDefault();
    
    // Clean up input: trim and preserve original casing for display
    const normalizedMood = customMood.toLowerCase().trim();
    setSelectedMood(customMood.trim()); // Keep original casing for display
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to get recommendations from Gemini for the custom mood
      const aiRecommendations = await getVideoRecommendations(customMood.trim());
      
      if (aiRecommendations && aiRecommendations.length > 0) {
        // Add default URLs if Gemini doesn't provide them
        const processedRecommendations = aiRecommendations.map(rec => {
          if (!rec.url) {
            // Create a YouTube search URL as fallback
            const searchQuery = encodeURIComponent(`${rec.title} ${rec.creator}`);
            rec.url = `https://www.youtube.com/results?search_query=${searchQuery}`;
          }
          return rec;
        });
        setRecommendations(processedRecommendations);
      } else {
        // If no AI recommendations, check our predefined lists
        if (Object.keys(videoRecommendations).includes(normalizedMood)) {
          setRecommendations(videoRecommendations[normalizedMood]);
        } else {
          // Try to find a similar mood
          const similarMood = findSimilarMood(normalizedMood);
          
          if (similarMood && videoRecommendations[similarMood]) {
            setRecommendations(videoRecommendations[similarMood]);
          } else {
            // If no match, provide default recommendations
            setRecommendations(defaultRecommendations);
          }
        }
      }
    } catch (err) {
      setError("Couldn't connect to our recommendation service. Using our curated list instead.");
      
      // Fallback to our predefined recommendations
      if (Object.keys(videoRecommendations).includes(normalizedMood)) {
        setRecommendations(videoRecommendations[normalizedMood]);
      } else {
        const similarMood = findSimilarMood(normalizedMood);
        
        if (similarMood && videoRecommendations[similarMood]) {
          setRecommendations(videoRecommendations[similarMood]);
        } else {
          setRecommendations(defaultRecommendations);
        }
      }
    } finally {
      setIsLoading(false);
      setStep('recommendations');
      setIsCustomMood(false);
    }
  };

  const handleReset = () => {
    setStep('initial');
    setSelectedMood('');
    setCustomMood('');
    setRecommendations([]);
    setIsCustomMood(false);
    setError(null);
  };

  // New function to handle video clicks
  const handleVideoClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-[90vh] max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg border border-indigo-200 mt-10 mb-10">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Video Recommendations</h2>
      
      {step === 'initial' && !isCustomMood && (
        <div className="space-y-6">
          <p className="text-lg text-gray-700">
            Videos can help shift your perspective and mood. Tell us how you're feeling today, and we'll recommend videos to support your mental wellbeing.
          </p>
          <button 
            className="text-indigo-500 font-medium flex items-center transition-all"
            onClick={() => window.location.href = 'https://www.youtube.com/playlist?list=PLqGwhvoVdgim-gfXZUipQB7AOZtVFlIHQ&jct=BefvjoCyOA3Rv0Vd67jMEPINkRNTEw'}
          >
            Pre Planned Video Recommendation Playlist
            <ArrowRight size={20} className="ml-2 transition-all" />
          </button>
          <h3 className="text-xl font-semibold text-gray-800 mt-6">How are you feeling today?</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {moods.map((mood) => (
              <button
                key={mood.id}
                className={`${mood.color} py-4 px-6 rounded-lg text-gray-800 font-medium hover:shadow-md transition-all flex items-center justify-center`}
                onClick={() => handleMoodSelect(mood.id)}
              >
                {mood.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isCustomMood && (
        <div className="space-y-6">
          <p className="text-lg text-gray-700">
            Tell us more about how you're feeling, and we'll find the perfect videos to match your mood.
          </p>
          
          <form onSubmit={handleCustomMoodSubmit} className="mt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={customMood}
                onChange={(e) => setCustomMood(e.target.value)}
                placeholder="Enter how you're feeling (e.g., 'hopeful', 'confused')"
                className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  disabled={!customMood}
                >
                  Find Videos
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-gray-700">Finding the perfect videos for you...</span>
        </div>
      )}

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
          <p className="text-yellow-700">{error}</p>
        </div>
      )}

      {step === 'recommendations' && !isLoading && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Videos for when you're feeling {selectedMood}:
            </h3>
            <button 
              onClick={handleReset}
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              ← Back to moods
            </button>
          </div>
          
          <div className="space-y-4 mt-4">
            {recommendations.map((video, index) => (
              <div 
                key={index} 
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleVideoClick(video.url)}
              >
                <div className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-3 mr-4 text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                      <polygon points="10 8 16 12 10 16 10 8"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-semibold text-lg text-gray-800">{video.title}</h4>
                      <ExternalLink size={16} className="ml-2 text-indigo-500" />
                    </div>
                    <p className="text-gray-600">by {video.creator}</p>
                    <p className="mt-2 text-gray-700">{video.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-700">
              Videos can provide comfort, inspiration, and new perspectives. Click on any recommendation to watch the video. These recommendations are selected to help support your current emotional state.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}