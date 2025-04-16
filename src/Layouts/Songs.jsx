import { useState } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { getSongRecommendations } from '../services/geminiService';

export default function Songs() {
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

  // Updated fallback recommendations to include URLs
  const songRecommendations = {
    anxious: [
      { title: "Weightless", artist: "Marconi Union", description: "Scientifically designed to reduce anxiety and slow heart rate", url: "https://open.spotify.com/track/5T5ZkPX9IWejYbZmxpr1lB" },
      { title: "Someone Like You", artist: "Adele", description: "A ballad with soothing vocals that creates a calming effect", url: "https://open.spotify.com/track/4kflIGfjdZJW4ot2ioixTB" },
      { title: "Electra", artist: "Airstream", description: "Ambient tones with a gentle rhythm to ground racing thoughts", url: "https://open.spotify.com/track/0azC730Exh71aQlOt9Zj3y" },
      { title: "Strawberry Swing", artist: "Coldplay", description: "Uplifting melody with a steady beat to ease anxious feelings", url: "https://open.spotify.com/track/19fGkRtI4JKJWtRCcYaOfV" },
      { title: "Watermark", artist: "Enya", description: "Ethereal vocals and serene instrumentals for anxiety relief", url: "https://open.spotify.com/track/6Hew9qHrvB8KOe1yXM6ryo" }
    ],
    sad: [
      { title: "Here Comes The Sun", artist: "The Beatles", description: "A hopeful classic about things getting better", url: "https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2" },
      { title: "Three Little Birds", artist: "Bob Marley", description: "Reassuring lyrics that 'every little thing is gonna be alright'", url: "https://open.spotify.com/track/6A9mKXlFRPMPem6ygQSt7z" },
      { title: "Unwritten", artist: "Natasha Bedingfield", description: "Uplifting song about possibilities and new beginnings", url: "https://open.spotify.com/track/2vj1k2gCsG2Uu4O1PpXA7I" },
      { title: "What a Wonderful World", artist: "Louis Armstrong", description: "A gentle reminder of the beauty in the world", url: "https://open.spotify.com/track/29U7stRjqHU6rMiS8BfaI9" },
      { title: "Shake It Out", artist: "Florence + The Machine", description: "Powerful anthem about letting go of sorrow", url: "https://open.spotify.com/track/4rbnDLTxBYFjVQrC5nNYeY" }
    ],
    stressed: [
      { title: "Clair de Lune", artist: "Claude Debussy", description: "Gentle piano piece that relieves tension", url: "https://open.spotify.com/track/2WfaOiMkCvy7F5fcp2zZ8L" },
      { title: "Breathe Me", artist: "Sia", description: "A soothing song with lyrics about needing comfort", url: "https://open.spotify.com/track/5yEPxDjbbzUzyauGtnmVEC" },
      { title: "Holocene", artist: "Bon Iver", description: "Atmospheric music that creates a sense of spaciousness", url: "https://open.spotify.com/track/4fbvXwMi4nu2QkX6yasXtW" },
      { title: "Gymnopédie No.1", artist: "Erik Satie", description: "Calm, flowing piano melody to slow racing thoughts", url: "https://open.spotify.com/track/5NGtFXVpXSvwunEIGeviY3" },
      { title: "Outro", artist: "M83", description: "Expansive instrumental that lifts you out of stress", url: "https://open.spotify.com/track/1L66IBx7Th7owJxGaIdpWM" }
    ],
    unmotivated: [
      { title: "Eye of the Tiger", artist: "Survivor", description: "Classic motivational anthem with energizing beat", url: "https://open.spotify.com/track/2KH16WveTQWT6KOG9Rg6e2" },
      { title: "Can't Stop the Feeling!", artist: "Justin Timberlake", description: "Upbeat tune that boosts energy and mood", url: "https://open.spotify.com/track/6JV2JOEocMgcZxYSZelKcc" },
      { title: "Roar", artist: "Katy Perry", description: "Empowering song about finding your voice and strength", url: "https://open.spotify.com/track/27tNWlWRhaUqWrX0StBnQh" },
      { title: "Stronger", artist: "Kelly Clarkson", description: "Reminder that challenges make you more resilient", url: "https://open.spotify.com/track/6D60klaHqbCl9ySc8VcRss" },
      { title: "This Is Me", artist: "Keala Settle", description: "Powerful anthem about self-acceptance and courage", url: "https://open.spotify.com/track/5r87Q6UyHlnPxlOhvMTu1M" }
    ],
    overwhelmed: [
      { title: "Breathe", artist: "Télépopmusik", description: "Gentle track with a soothing reminder to just breathe", url: "https://open.spotify.com/track/4ofsU81zKnV9EKdhgVp5XF" },
      { title: "Everything's Not Lost", artist: "Coldplay", description: "Reassuring message about finding hope in difficult times", url: "https://open.spotify.com/track/1ZxcX1ZGPcI6IYpywP0nXm" },
      { title: "Intro", artist: "The xx", description: "Minimal, spacious instrumental that creates mental room", url: "https://open.spotify.com/track/0LHroM9hQGi7K7zYOTQXcP" },
      { title: "Landslide", artist: "Fleetwood Mac", description: "Reflective song about weathering life's changes", url: "https://open.spotify.com/track/5ihS6UUlyQAfmp48eSkxuQ" },
      { title: "Let It Go", artist: "James Bay", description: "About releasing what weighs you down when feeling overwhelmed", url: "https://open.spotify.com/track/13HVjjWUZFaWilh2QUJKsP" }
    ]
  };

  // Default recommendations with URLs
  const defaultRecommendations = [
    { title: "Happy", artist: "Pharrell Williams", description: "Infectious upbeat song that celebrates happiness", url: "https://open.spotify.com/track/60nZcImufyMA1MKQY3dcCH" },
    { title: "Somewhere Over the Rainbow", artist: "Israel Kamakawiwo'ole", description: "Soothing ukulele version of the classic hopeful song", url: "https://open.spotify.com/track/1cYRDQGMX1OvRCKc3oYwUZ" },
    { title: "Three Little Birds", artist: "Bob Marley", description: "Reassuring lyrics that 'every little thing is gonna be alright'", url: "https://open.spotify.com/track/6A9mKXlFRPMPem6ygQSt7z" },
    { title: "What a Wonderful World", artist: "Louis Armstrong", description: "A gentle reminder of the beauty in the world", url: "https://open.spotify.com/track/29U7stRjqHU6rMiS8BfaI9" },
    { title: "Don't Stop Believin'", artist: "Journey", description: "Iconic motivational anthem about holding onto hope", url: "https://open.spotify.com/track/4bHsxqR3GMrXTxEPLuK5ue" }
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
      
      // Happy group
      'happy': 'happy',
      'joyful': 'happy',
      'excited': 'happy',
      'content': 'happy'
    };
    
    return moodMapping[inputMood.toLowerCase()] || null;
  };

  // New function to handle song clicks
  const handleSongClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
      const aiRecommendations = await getSongRecommendations(mood);
      
      if (aiRecommendations && aiRecommendations.length > 0) {
        // Add default URLs if Gemini doesn't provide them
        const processedRecommendations = aiRecommendations.map(rec => {
          if (!rec.url) {
            // Create a Spotify search URL as fallback
            const searchQuery = encodeURIComponent(`${rec.title} ${rec.artist}`);
            rec.url = `https://open.spotify.com/search/${searchQuery}`;
          }
          return rec;
        });
        setRecommendations(processedRecommendations);
      } else {
        // Fallback to our predefined recommendations
        setRecommendations(songRecommendations[mood] || defaultRecommendations);
      }
    } catch (err) {
      setError("Couldn't connect to our recommendation service. Using our curated list instead.");
      // Fallback to our predefined recommendations
      setRecommendations(songRecommendations[mood] || defaultRecommendations);
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
      const aiRecommendations = await getSongRecommendations(customMood.trim());
      
      if (aiRecommendations && aiRecommendations.length > 0) {
        // Add default URLs if Gemini doesn't provide them
        const processedRecommendations = aiRecommendations.map(rec => {
          if (!rec.url) {
            // Create a Spotify search URL as fallback
            const searchQuery = encodeURIComponent(`${rec.title} ${rec.artist}`);
            rec.url = `https://open.spotify.com/search/${searchQuery}`;
          }
          return rec;
        });
        setRecommendations(processedRecommendations);
      } else {
        // If no AI recommendations, check our predefined lists
        if (Object.keys(songRecommendations).includes(normalizedMood)) {
          setRecommendations(songRecommendations[normalizedMood]);
        } else {
          // Try to find a similar mood
          const similarMood = findSimilarMood(normalizedMood);
          
          if (similarMood && songRecommendations[similarMood]) {
            setRecommendations(songRecommendations[similarMood]);
          } else {
            // If no match, provide default recommendations
            setRecommendations(defaultRecommendations);
          }
        }
      }
    } catch (err) {
      setError("Couldn't connect to our recommendation service. Using our curated list instead.");
      
      // Fallback to our predefined recommendations
      if (Object.keys(songRecommendations).includes(normalizedMood)) {
        setRecommendations(songRecommendations[normalizedMood]);
      } else {
        const similarMood = findSimilarMood(normalizedMood);
        
        if (similarMood && songRecommendations[similarMood]) {
          setRecommendations(songRecommendations[similarMood]);
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

  return (
    <div className="min-h-[90vh] max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg border border-teal-200 mt-10 mb-10">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Music Recommendations</h2>
      
      {step === 'initial' && !isCustomMood && (
        <div className="space-y-6">
          <p className="text-lg text-gray-700">
            Music has a powerful effect on our emotions. Tell us how you're feeling today, and we'll recommend some songs to support your mental wellbeing.
          </p>
          <button 
            className="text-teal-500 font-medium flex items-center transition-all"
            onClick={() => window.location.href = 'https://open.spotify.com/playlist/2dHZPtwfohNUrdnyQxm5qm?pi=a-GH2oexWtSHac&nd=1&dlsi=48b2d54534c44988'}
          >
            Pre Planned Music Recommendation Playlist
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
            Tell us more about how you're feeling, and we'll find the perfect songs to match your mood.
          </p>
          
          <form onSubmit={handleCustomMoodSubmit} className="mt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={customMood}
                onChange={(e) => setCustomMood(e.target.value)}
                placeholder="Enter how you're feeling (e.g., 'hopeful', 'confused')"
                className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  disabled={!customMood || isLoading}
                >
                  {isLoading ? 'Finding Songs...' : 'Find Songs'}
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

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
          <p className="text-yellow-700">{error}</p>
        </div>
      )}

      {step === 'recommendations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Songs for when you're feeling {selectedMood}:
            </h3>
            <button 
              onClick={handleReset}
              className="text-teal-600 hover:text-teal-800 flex items-center"
            >
              ← Back to moods
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center my-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {recommendations.map((song, index) => (
                <div 
                  key={index} 
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleSongClick(song.url)}
                >
                  <div className="flex items-start">
                    <div className="bg-teal-100 rounded-full p-3 mr-4 text-teal-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polygon points="10 8 16 12 10 16 10 8"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-semibold text-lg text-gray-800">{song.title}</h4>
                        <ExternalLink size={16} className="ml-2 text-teal-500" />
                      </div>
                      <p className="text-gray-600">by {song.artist}</p>
                      <p className="mt-2 text-gray-700">{song.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-700">
              Music can be a powerful tool for emotional wellbeing. Click on any song to listen. These songs are selected to help comfort, uplift, or validate your feelings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}