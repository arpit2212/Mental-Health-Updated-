import { useState, useEffect } from 'react';
import { Calendar, Clock, Save, Send, BookOpen, ArrowLeft, ArrowRight, Trash2, Edit } from 'lucide-react';
import { diaryService } from '../services/diaryService';
import { useSupabaseUser } from '../hooks/useSupabaseUser';

const DearDiary = () => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mood, setMood] = useState('neutral');
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Get the current user from our custom hook
  const { user } = useSupabaseUser();
  
  // Get Gemini API key from environment variables
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  // Load entries from database on component mount and when selectedDate changes
  useEffect(() => {
    if (!user?.id) {
      console.log('No user ID available yet, skipping entry loading');
      setIsDataLoading(false);
      return;
    }
    
    console.log('Loading entries for user:', user.id);
    
    const loadEntriesForDate = async () => {
      setIsDataLoading(true);
      try {
        const entriesData = await diaryService.getEntriesByDate(user.id, selectedDate);
        console.log('Loaded entries:', entriesData);
        setEntries(entriesData || []);
      } catch (error) {
        console.error('Failed to load diary entries:', error);
        setEntries([]);
      } finally {
        setIsDataLoading(false);
      }
    };
    
    loadEntriesForDate();
  }, [user, selectedDate]);
  
  // Format date to YYYY-MM-DD for input value
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Format date to display format
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get current time
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Save the current diary entry
  const saveEntry = async () => {
    if (!user?.id) {
      console.error('Cannot save entry: No user ID available', user);
      alert('Please make sure you are logged in before saving entries.');
      return;
    }
    
    if (currentEntry.trim() === '') return;
    
    setIsSaving(true);
    
    try {
      console.log('Saving entry with user ID:', user.id);
      
      // If we're editing an existing entry
      if (editingEntry) {
        const updatedEntry = {
          text: currentEntry,
          mood: mood
        };
        
        await diaryService.updateDiaryEntry(editingEntry.id, updatedEntry);
        
        // Update the entries list
        setEntries(entries.map(entry => 
          entry.id === editingEntry.id 
            ? { ...entry, entry_text: currentEntry, mood: mood }
            : entry
        ));
        
        setEditingEntry(null);
      } else {
        // Creating a new entry
        const newEntry = {
          date: selectedDate.toISOString(),
          text: currentEntry,
          timestamp: getCurrentTime(),
          mood: mood,
        };
        
        const savedEntry = await diaryService.saveDiaryEntry(user.id, newEntry);
        
        // Add the new entry to the list
        if (savedEntry) {
          setEntries([...entries, savedEntry]);
        }
      }
      
      // Reset form
      setCurrentEntry('');
      setAiRecommendation('');
      setShowRecommendation(false);
      
    } catch (error) {
      console.error('Error saving diary entry:', error);
      alert('Failed to save your diary entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  

  // Delete a diary entry
  const deleteEntry = async (entryId) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await diaryService.deleteDiaryEntry(entryId);
      setEntries(entries.filter(entry => entry.id !== entryId));
      
      // If we're currently editing this entry, reset the form
      if (editingEntry && editingEntry.id === entryId) {
        setEditingEntry(null);
        setCurrentEntry('');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete the entry. Please try again.');
    }
  };

  // Edit a diary entry
  const startEditing = (entry) => {
    setEditingEntry(entry);
    setCurrentEntry(entry.entry_text);
    setMood(entry.mood);
    setAiRecommendation('');
    setShowRecommendation(false);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingEntry(null);
    setCurrentEntry('');
    setMood('neutral');
  };

  // Get AI recommendation using Gemini API
  const getAiRecommendation = async () => {
    if (!currentEntry.trim()) return;
    
    setIsLoading(true);
    setShowRecommendation(false);
    
    try {
      // Construct the prompt for Gemini
      const prompt = `
        You are a thoughtful AI diary assistant. Based on the following diary entry and the user's mood (${mood}), 
        please provide a short, personalized reflection or suggestion that is supportive and helpful.
        
        Diary entry: "${currentEntry}"
        
        Keep your response under 3 sentences, be empathetic, and focus on providing a constructive insight or gentle suggestion.
      `;
      
      // Make API call to Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI recommendation');
      }
      
      const data = await response.json();
      
      // Extract the recommendation text from the response
      if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
        const recommendationText = data.candidates[0].content.parts[0].text;
        setAiRecommendation(recommendationText);
        setShowRecommendation(true);
      } else {
        // Fallback in case of unexpected response format
        setAiRecommendation("I notice you're sharing your thoughts. Remember that reflection is a valuable practice for personal growth.");
        setShowRecommendation(true);
      }
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
      setAiRecommendation("I couldn't generate a recommendation right now. Please try again later.");
      setShowRecommendation(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to previous or next day
  const navigateDay = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  // Mood options with emojis
  const moodOptions = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'angry', emoji: '😠', label: 'Angry' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' }
  ];

  return (
    <div className="bg-[#dce1e3] min-h-screen p-6 flex flex-col">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-teal-500">My AI Diary</h1>
          <div className="flex space-x-3">
            <button 
              onClick={() => navigateDay(-1)}
              className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
            >
              <ArrowLeft className="text-teal-500" />
            </button>
            <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow">
              <Calendar className="text-teal-500 mr-2" />
              <input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="outline-none"
              />
            </div>
            <button 
              onClick={() => navigateDay(1)}
              className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
            >
              <ArrowRight className="text-teal-500" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Diary Entry */}
          <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative">
              {/* Diary page styling */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-teal-50 border-r border-teal-100"></div>
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-300"></div>
              
              {/* Diary header */}
              <div className="pl-16 pr-6 py-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {editingEntry ? 'Edit Entry' : formatDate(selectedDate)}
                </h2>
                <div className="flex items-center text-gray-500 mt-2">
                  <Clock size={16} className="mr-2" />
                  <span>{getCurrentTime()}</span>
                </div>
                
                {/* Mood selector */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">How are you feeling today?</p>
                  <div className="flex space-x-3">
                    {moodOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setMood(option.value)}
                        className={`flex flex-col items-center p-2 rounded-lg ${mood === option.value ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50'}`}
                      >
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="text-xs mt-1">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Diary entry textarea */}
              <div className="pl-16 pr-6 py-6">
                <textarea
                  value={currentEntry}
                  onChange={(e) => setCurrentEntry(e.target.value)}
                  placeholder="Dear Diary..."
                  className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
                  style={{ lineHeight: '1.8' }}
                ></textarea>
                
                <div className="flex justify-between mt-4">
                  {!editingEntry ? (
                    <button
                      onClick={getAiRecommendation}
                      className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                      disabled={currentEntry.trim() === '' || isLoading}
                    >
                      <Send size={18} className="mr-2" />
                      {isLoading ? 'Getting insights...' : 'Get AI insights'}
                    </button>
                  ) : (
                    <button
                      onClick={cancelEditing}
                      className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                  )}
                  
                  <button
                    onClick={saveEntry}
                    className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                    disabled={currentEntry.trim() === '' || isSaving}
                  >
                    <Save size={18} className="mr-2" />
                    {isSaving ? 'Saving...' : editingEntry ? 'Update entry' : 'Save entry'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Past Entries & AI Recommendation */}
          <div className="w-full lg:w-96">
            {/* AI Recommendation Section */}
            {showRecommendation && aiRecommendation && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="text-xl mr-2">✨</span> AI Reflection
                </h3>
                <p className="mt-3 text-gray-600">{aiRecommendation}</p>
                <button 
                  onClick={() => setShowRecommendation(false)}
                  className="mt-4 text-sm text-teal-500 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            
            {/* Past Entries Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 bg-teal-50 border-b border-teal-100">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <BookOpen size={18} className="mr-2 text-teal-500" />
                  Entries for {formatDate(selectedDate)}
                </h3>
              </div>
              
              <div className="p-4">
                {isDataLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading entries...</p>
                  </div>
                ) : entries.length > 0 ? (
                  <div className="space-y-4">
                    {entries.map(entry => (
                      <div key={entry.id} className="border-b border-gray-100 pb-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                          <span>{entry.timestamp}</span>
                          <div className="flex space-x-2 items-center">
                            <span>
                              {moodOptions.find(m => m.value === entry.mood)?.emoji || '😐'}
                            </span>
                            <button 
                              onClick={() => startEditing(entry)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Edit entry"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => deleteEntry(entry.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700">{entry.entry_text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No entries for this date yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DearDiary;