import { useState, useEffect } from 'react';
import { getBookRecommendations } from '../services/bookService';

export default function Books() {
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

  const bookRecommendations = {
    anxious: [
      { title: "The Worry Trick", author: "David Carbonell", description: "How your brain tricks you into expecting the worst and what you can do about it" },
      { title: "Hope and Help for Your Nerves", author: "Claire Weekes", description: "End anxiety, panic, and fear" },
      { title: "First, We Make the Beast Beautiful", author: "Sarah Wilson", description: "A journey through anxiety" },
      { title: "Dare", author: "Barry McDonagh", description: "The new way to end anxiety and stop panic attacks" }
    ],
    sad: [
      { title: "The Book of Joy", author: "Dalai Lama & Desmond Tutu", description: "Lasting happiness in a changing world" },
      { title: "Man's Search for Meaning", author: "Viktor Frankl", description: "The classic tribute to hope from the Holocaust" },
      { title: "The Midnight Library", author: "Matt Haig", description: "A novel about regret, hope, and second chances" },
      { title: "Reasons to Stay Alive", author: "Matt Haig", description: "A memoir about making the most of your time on earth" },
      { title: "When Things Fall Apart", author: "Pema Chödrön", description: "Heart advice for difficult times" }
    ],
    stressed: [
      { title: "Why Zebras Don't Get Ulcers", author: "Robert Sapolsky", description: "The acclaimed guide to stress, stress-related diseases, and coping" },
      { title: "10% Happier", author: "Dan Harris", description: "How I tamed the voice in my head, reduced stress without losing my edge" },
      { title: "The Upside of Stress", author: "Kelly McGonigal", description: "Why stress is good for you and how to get good at it" },
      { title: "Burnout", author: "Emily & Amelia Nagoski", description: "The secret to unlocking the stress cycle" },
      { title: "Full Catastrophe Living", author: "Jon Kabat-Zinn", description: "Using the wisdom of your body and mind to face stress" }
    ],
    unmotivated: [
      { title: "Atomic Habits", author: "James Clear", description: "An easy & proven way to build good habits & break bad ones" },
      { title: "Big Magic", author: "Elizabeth Gilbert", description: "Creative living beyond fear" },
      { title: "The War of Art", author: "Steven Pressfield", description: "Break through blocks and win your inner creative battles" },
      { title: "Mindset", author: "Carol S. Dweck", description: "The new psychology of success" },
      { title: "Tiny Beautiful Things", author: "Cheryl Strayed", description: "Advice on love and life from Dear Sugar" }
    ],
    overwhelmed: [
      { title: "Essentialism", author: "Greg McKeown", description: "The disciplined pursuit of less" },
      { title: "When Things Fall Apart", author: "Pema Chödrön", description: "Heart advice for difficult times" },
      { title: "How to Do Nothing", author: "Jenny Odell", description: "Resisting the attention economy" },
      { title: "Present Over Perfect", author: "Shauna Niequist", description: "Leaving behind frantic for a simpler, more soulful way of living" },
      { title: "The Power of Now", author: "Eckhart Tolle", description: "A guide to spiritual enlightenment" }
    ],
    // Additional moods from original code...
  };

  // Default recommendations for moods not in our predefined list
  const defaultRecommendations = [
    { title: "The Book of Joy", author: "Dalai Lama & Desmond Tutu", description: "Lasting happiness in a changing world" },
    { title: "Tiny Beautiful Things", author: "Cheryl Strayed", description: "Advice on love and life from Dear Sugar" },
    { title: "Man's Search for Meaning", author: "Viktor Frankl", description: "The classic tribute to hope from the Holocaust" },
    { title: "Present Over Perfect", author: "Shauna Niequist", description: "Leaving behind frantic for a simpler, more soulful way of living" },
    { title: "The Power of Now", author: "Eckhart Tolle", description: "A guide to spiritual enlightenment" }
  ];

  // This function finds the closest matching mood from our defined list
  const findSimilarMood = (inputMood) => {
    // Simple matching for common emotions - from original code
    const moodMapping = {
      'nervous': 'anxious',
      'afraid': 'anxious',
      'fearful': 'anxious',
      'panic': 'anxious',
      'worried': 'anxious',
      'uneasy': 'anxious',
      // Other mood mappings from the original code...
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
      const aiRecommendations = await getBookRecommendations(mood);
      
      if (aiRecommendations && aiRecommendations.length > 0) {
        setRecommendations(aiRecommendations);
      } else {
        // Fallback to our predefined recommendations
        setRecommendations(bookRecommendations[mood] || defaultRecommendations);
      }
    } catch (err) {
      setError("Couldn't connect to our recommendation service. Using our curated list instead.");
      // Fallback to our predefined recommendations
      setRecommendations(bookRecommendations[mood] || defaultRecommendations);
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
      const aiRecommendations = await getBookRecommendations(customMood.trim());
      
      if (aiRecommendations && aiRecommendations.length > 0) {
        setRecommendations(aiRecommendations);
      } else {
        // If no AI recommendations, check our predefined lists
        if (Object.keys(bookRecommendations).includes(normalizedMood)) {
          setRecommendations(bookRecommendations[normalizedMood]);
        } else {
          // Try to find a similar mood
          const similarMood = findSimilarMood(normalizedMood);
          
          if (similarMood && bookRecommendations[similarMood]) {
            setRecommendations(bookRecommendations[similarMood]);
          } else {
            // If no match, provide default recommendations
            setRecommendations(defaultRecommendations);
          }
        }
      }
    } catch (err) {
      setError("Couldn't connect to our recommendation service. Using our curated list instead.");
      
      // Fallback to our predefined recommendations
      if (Object.keys(bookRecommendations).includes(normalizedMood)) {
        setRecommendations(bookRecommendations[normalizedMood]);
      } else {
        const similarMood = findSimilarMood(normalizedMood);
        
        if (similarMood && bookRecommendations[similarMood]) {
          setRecommendations(bookRecommendations[similarMood]);
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
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Book Recommendations</h2>
      
      {step === 'initial' && !isCustomMood && (
        <div className="space-y-6">
          <p className="text-lg text-gray-700">
            Books can be powerful tools for healing. Tell us how you're feeling today, and we'll recommend some positive reads to support your mental wellbeing.
          </p>
          
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
            Tell us more about how you're feeling, and we'll find the perfect books to match your mood.
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
                  disabled={!customMood}
                >
                  Find Books
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <span className="ml-3 text-gray-700">Finding the perfect books for you...</span>
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
              Books for when you're feeling {selectedMood}:
            </h3>
            <button 
              onClick={handleReset}
              className="text-teal-600 hover:text-teal-800 flex items-center"
            >
              ← Back to moods
            </button>
          </div>
          
          <div className="space-y-4 mt-4">
            {recommendations.map((book, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg text-gray-800">{book.title}</h4>
                <p className="text-gray-600">by {book.author}</p>
                <p className="mt-2 text-gray-700">{book.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-700">
              Remember, these books are just suggestions. Everyone's journey is different, and it's okay to take your time healing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
