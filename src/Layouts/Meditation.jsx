import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RefreshCcw, Clock, Settings, Moon, Mic, MicOff } from 'lucide-react';

export default function MeditationPage() {
  const [meditationTime, setMeditationTime] = useState(300); // 5 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(meditationTime);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAmbience, setSelectedAmbience] = useState('forest');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);
  
  const audioRef = useRef(new Audio());
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // Define audio files
  const ambienceSounds = [
    { 
      id: 'forest', 
      name: 'Forest Sounds', 
      duration: '5-10 min', 
      file: '/audio/forest.mp3' // This file should be in public/audio/forest.mp3
    },
    { 
      id: 'ocean', 
      name: 'Ocean Waves', 
      duration: '10-15 min', 
      file: '/audio/ocean.mp3' 
    },
    { 
      id: 'rain', 
      name: 'Gentle Rain', 
      duration: '15-20 min', 
      file: '/audio/rain.mp3' 
    },
    { 
      id: 'singing-bowl', 
      name: 'Singing Bowl', 
      duration: '20-30 min', 
      file: '/audio/singing-bowl.mp3' 
    }
  ];

  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleLoadStart = () => setAudioLoading(true);
    const handleCanPlay = () => setAudioLoading(false);
    const handleError = () => {
      setAudioLoading(false);
      setAudioError("Couldn't load audio. Please try another sound or check if files exist.");
      console.error("Audio error:", audio.error);
    };
    
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    
    // Set initial audio properties
    audio.loop = true;
    audio.volume = 0.5;
    
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Handle playing the selected audio
  useEffect(() => {
    const audio = audioRef.current;
    const sound = ambienceSounds.find(s => s.id === selectedAmbience);
    
    if (sound) {
      // Reset any previous errors
      setAudioError(null);
      
      // Set new audio source
      audio.src = sound.file;
      
      // Fallback to demo audio if file doesn't exist or has error
      audio.onerror = () => {
        // Create oscillator as fallback
        console.log("Audio file error, using fallback oscillator");
        useOscillatorFallback();
      };
      
      // Handle play/pause based on meditation state
      if (isActive && !isMuted) {
        const playPromise = audio.play();
        
        // Handle autoplay policy issues
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Playback prevented by browser:", error);
            // Don't show error to user, as this is usually due to interaction requirements
          });
        }
      } else {
        audio.pause();
      }
    }
    
    return () => {
      audio.pause();
    };
  }, [isActive, isMuted, selectedAmbience]);

  // Oscillator fallback if audio files don't load
  const useOscillatorFallback = () => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      // Configure oscillator
      oscillator.type = selectedAmbience === 'singing-bowl' ? 'sine' : 'triangle';
      oscillator.frequency.value = {
        'forest': 432,
        'ocean': 396,
        'rain': 528,
        'singing-bowl': 639
      }[selectedAmbience] || 432;
      
      // Set volume
      gainNode.gain.value = 0.1;
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      // Start and stop based on state
      if (isActive && !isMuted) {
        oscillator.start();
        return oscillator;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to create fallback audio:", error);
      return null;
    }
  };

  // Set up voice recognition
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceMessage('Voice recognition not supported in this browser');
      return null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setVoiceMessage('Listening for commands...');
    };
    
    recognition.onend = () => {
      if (voiceEnabled) {
        // Restart if it was still supposed to be enabled
        try {
          recognition.start();
        } catch (e) {
          console.error("Failed to restart recognition:", e);
          setVoiceMessage('Voice recognition stopped. Please re-enable.');
          setVoiceEnabled(false);
        }
      }
    };
    
    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
      setVoiceMessage(`Error: ${event.error}`);
      if (event.error === 'not-allowed') {
        setVoiceEnabled(false);
      }
    };
    
    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.toLowerCase().trim();
      
      setVoiceMessage(`Heard: "${command}"`);
      
      if (command.includes('start') || command.includes('begin')) {
        startTimer();
        setVoiceMessage('Command recognized: Starting meditation');
      } else if (command.includes('stop') || command.includes('pause')) {
        pauseTimer();
        setVoiceMessage('Command recognized: Pausing meditation');
      } else if (command.includes('reset')) {
        resetTimer();
        setVoiceMessage('Command recognized: Resetting timer');
      } else if (command.includes('mute') || command.includes('silence')) {
        setIsMuted(true);
        setVoiceMessage('Command recognized: Muting audio');
      } else if (command.includes('unmute') || command.includes('sound on')) {
        setIsMuted(false);
        setVoiceMessage('Command recognized: Unmuting audio');
      }
      
      // Clear message after 3 seconds
      setTimeout(() => {
        if (voiceEnabled) {
          setVoiceMessage('Listening for commands...');
        }
      }, 3000);
    };
    
    try {
      recognition.start();
      recognitionRef.current = recognition;
      return recognition;
    } catch (error) {
      console.error("Recognition start error:", error);
      setVoiceMessage(`Couldn't start recognition: ${error.message}`);
      return null;
    }
  };

  const toggleVoiceRecognition = () => {
    if (voiceEnabled) {
      setVoiceEnabled(false);
      setVoiceMessage('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping recognition:", e);
        }
        recognitionRef.current = null;
      }
    } else {
      setVoiceEnabled(true);
      startVoiceRecognition();
    }
  };

  // Handle cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping recognition on unmount:", e);
        }
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Timer functionality
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
      
      // Play completion sound
      const completionSound = new Audio('/audio/completion.mp3');
      completionSound.volume = 0.7;
      completionSound.play().catch(err => console.error("Could not play completion sound:", err));
      
      // Vibrate device if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeRemaining]);

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(meditationTime);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const updateMeditationTime = (seconds) => {
    setMeditationTime(seconds);
    setTimeRemaining(seconds);
    resetTimer();
  };

  const selectAmbience = (ambienceId) => {
    setSelectedAmbience(ambienceId);
  };

  // Suggested meditation times
  const suggestedTimes = [
    { name: "Quick Break", seconds: 180, description: "A short 3-minute refresh" },
    { name: "Basic", seconds: 300, description: "Standard 5-minute session" },
    { name: "Deep Focus", seconds: 600, description: "10-minute deeper practice" },
    { name: "Extended", seconds: 900, description: "15-minute complete session" }
  ];

  return (
    <div className="bg-[#dce1e3] min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            <span className="text-teal-500">Meditation</span> Timer
          </h1>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center">
            <div className="w-64 h-64 rounded-full bg-teal-50 flex items-center justify-center mb-6 relative">
              <div className="text-5xl font-bold text-gray-800">{formatTime(timeRemaining)}</div>
              {isActive && (
                <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
              )}
            </div>
            
            <div className="flex gap-4 mb-6">
              <button
                onClick={startTimer}
                disabled={isActive}
                className={`p-4 rounded-full ${isActive ? 'bg-gray-200' : 'bg-teal-500 hover:bg-teal-600'} transition`}
              >
                <Play size={24} className={isActive ? 'text-gray-500' : 'text-white'} />
              </button>
              
              <button
                onClick={pauseTimer}
                disabled={!isActive}
                className={`p-4 rounded-full ${!isActive ? 'bg-gray-200' : 'bg-teal-500 hover:bg-teal-600'} transition`}
              >
                <Pause size={24} className={!isActive ? 'text-gray-500' : 'text-white'} />
              </button>
              
              <button
                onClick={resetTimer}
                className="p-4 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                <RefreshCcw size={24} className="text-gray-700" />
              </button>
              
              <button
                onClick={toggleMute}
                className="p-4 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              >
                {isMuted ? (
                  <VolumeX size={24} className="text-gray-700" />
                ) : (
                  <Volume2 size={24} className="text-gray-700" />
                )}
              </button>
            </div>
            
            <div className="w-full text-center bg-teal-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Current sound:</span> {ambienceSounds.find(s => s.id === selectedAmbience)?.name}
              </p>
              <div className="text-sm text-gray-600">
                {audioLoading ? 'Loading audio...' : 
                audioError ? audioError :
                (isActive && !isMuted ? 'Sound is playing' : 'Sound is paused')}
              </div>
            </div>
            
            <button
              onClick={toggleVoiceRecognition}
              className={`w-full p-3 rounded-lg ${voiceEnabled ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-teal-600 hover:text-white transition flex items-center justify-center gap-2`}
            >
              {voiceEnabled ? <Mic size={18} /> : <MicOff size={18} />}
              {voiceEnabled ? 'Voice Control Enabled' : 'Enable Voice Control'}
            </button>
            
            {voiceMessage && (
              <div className="mt-3 w-full p-2 bg-blue-50 text-blue-700 text-sm rounded">
                {voiceMessage}
              </div>
            )}
          </div>
          
          {showSettings ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Clock size={18} />
                  Choose Duration
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {suggestedTimes.map((time) => (
                    <button
                      key={time.seconds}
                      onClick={() => updateMeditationTime(time.seconds)}
                      className={`p-3 rounded-lg ${meditationTime === time.seconds ? 'bg-teal-100 border border-teal-500' : 'bg-gray-100 hover:bg-gray-200'} transition`}
                    >
                      <div className="font-medium text-gray-800">{time.name}</div>
                      <div className="text-sm text-gray-600">{time.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Volume2 size={18} />
                  Background Sound
                </h3>
                <div className="space-y-2">
                  {ambienceSounds.map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => selectAmbience(sound.id)}
                      className={`w-full p-3 rounded-lg flex justify-between items-center ${selectedAmbience === sound.id ? 'bg-teal-100 border border-teal-500' : 'bg-gray-100 hover:bg-gray-200'} transition`}
                    >
                      <div className="font-medium text-gray-800">{sound.name}</div>
                      <div className="text-sm text-gray-600">Best for {sound.duration}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Moon size={20} />
                Suggested Sessions
              </h2>
              
              <div className="space-y-4">
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-medium text-teal-800 mb-1">Mindful Breathing</h3>
                  <p className="text-gray-700 text-sm">Focus on your breath. Follow each inhalation and exhalation.</p>
                  <button 
                    onClick={() => {
                      updateMeditationTime(300);
                      selectAmbience('forest');
                    }}
                    className="mt-2 text-teal-600 text-sm font-medium hover:text-teal-800"
                  >
                    Try 5 minutes →
                  </button>
                </div>
                
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-medium text-teal-800 mb-1">Body Scan</h3>
                  <p className="text-gray-700 text-sm">Slowly bring attention to each part of your body, from toes to head.</p>
                  <button 
                    onClick={() => {
                      updateMeditationTime(600);
                      selectAmbience('ocean');
                    }}
                    className="mt-2 text-teal-600 text-sm font-medium hover:text-teal-800"
                  >
                    Try 10 minutes →
                  </button>
                </div>
                
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-medium text-teal-800 mb-1">Loving-Kindness</h3>
                  <p className="text-gray-700 text-sm">Generate feelings of compassion for yourself and others.</p>
                  <button 
                    onClick={() => {
                      updateMeditationTime(900);
                      selectAmbience('singing-bowl');
                    }}
                    className="mt-2 text-teal-600 text-sm font-medium hover:text-teal-800"
                  >
                    Try 15 minutes →
                  </button>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-1">Personalized Recommendation</h3>
                  <p className="text-gray-700 text-sm">Based on your previous sessions, we recommend a 10-minute Forest Sounds meditation.</p>
                  <button 
                    onClick={() => {
                      updateMeditationTime(600);
                      selectAmbience('forest');
                    }}
                    className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-800"
                  >
                    Start recommended session →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-medium text-gray-800 mb-4">How To Meditate</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-teal-600 mb-1">1. Find a comfortable position</div>
              <p className="text-sm text-gray-700">Sit or lie down in a position you can maintain for your session.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-teal-600 mb-1">2. Focus on your breath</div>
              <p className="text-sm text-gray-700">Pay attention to the sensation of breathing in and out.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-teal-600 mb-1">3. Return when distracted</div>
              <p className="text-sm text-gray-700">When your mind wanders, gently return focus to your breath.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}