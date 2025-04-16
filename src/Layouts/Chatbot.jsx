import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
  const [chatStarted, setChatStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userSpeech, setUserSpeech] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [count, setCount] = useState(0);
  const [botReady, setBotReady] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [usingTextInput, setUsingTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [networkErrorCount, setNetworkErrorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const speechRecognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const currentSpeechRef = useRef(''); 
  const textInputRef = useRef(null);

  // Initialize the speech components
  useEffect(() => {
    // Check if API key is available
    if (!geminiApiKey) {
      console.error("Gemini API key not found. Please check your .env file.");
      setBotResponse("Error: API key not found. Please check your setup.");
      return;
    }

    // Set bot as ready since we don't need to load any brain file
    setBotReady(true);
    
    // Initial welcome message
    const welcomeMessage = "Hello! I'm ready to talk when you are.";
    setBotResponse(welcomeMessage);

    // Initialize speech synthesis
    if (window.speechSynthesis) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // Force load voices - this can help with speech synthesis initialization
      speechSynthesisRef.current.getVoices();
      
      // Add a listener for when voices are loaded (may be asynchronous in some browsers)
      if (speechSynthesisRef.current.onvoiceschanged !== undefined) {
        speechSynthesisRef.current.onvoiceschanged = () => {
          console.log("Voices loaded:", speechSynthesisRef.current.getVoices().length);
        };
      }
    } else {
      console.error("Speech synthesis not supported");
      setSpeechSupported(false);
    }

    // Initialize speech recognition - but use a timeout to ensure browser is ready
    setTimeout(() => {
      const supported = initializeSpeechRecognition();
      setSpeechSupported(supported);
      if (!supported) {
        setUsingTextInput(true);
      }
    }, 1000);
    
    // Cleanup
    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch (e) {
          console.error("Error aborting speech recognition:", e);
        }
      }
      if (speechSynthesisRef.current) {
        try {
          speechSynthesisRef.current.cancel();
        } catch (e) {
          console.error("Error cancelling speech synthesis:", e);
        }
      }
    };
  }, [geminiApiKey]);

  // Separate function to initialize speech recognition
  const initializeSpeechRecognition = () => {
    // Check if speech recognition is available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported");
      return false;
    }
    
    try {
      const recognition = new SpeechRecognition();
      
      // Configure recognition - try to make it more robust
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 3; // Get multiple alternatives
      
      // Recognition start handler
      recognition.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
        setUserSpeech('');
        currentSpeechRef.current = '';
      };
      
      // Recognition result handler
      recognition.onresult = (event) => {
        console.log("Speech recognition result received");
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setUserSpeech(transcript);
        currentSpeechRef.current = transcript;
        console.log("Transcript:", transcript);
      };
      
      // Recognition end handler
      recognition.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
        
        const finalSpeech = currentSpeechRef.current;
        if (finalSpeech && finalSpeech.trim().length > 0) {
          console.log("Processing final speech:", finalSpeech);
          getGeminiResponse(finalSpeech);
        } else if (networkErrorCount > 2) {
          // After multiple network errors, suggest text input
          setUsingTextInput(true);
          setBotResponse("It seems there are issues with the microphone. Please try typing your message instead.");
        } else {
          console.log("No speech detected");
          setBotResponse("I didn't hear anything. Please try again or type your message below.");
        }
      };
      
      // Error handler with network error workaround
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        
        switch (event.error) {
          case 'network':
            // Increment network error count
            setNetworkErrorCount(prev => prev + 1);
            
            if (networkErrorCount >= 2) {
              // After multiple network errors, switch to text input
              setUsingTextInput(true);
              setBotResponse("Network issues detected with speech recognition. Please type your message instead.");
            } else {
              setBotResponse("Network error with the microphone. Please try again or use text input.");
            }
            break;
          case 'not-allowed':
            setBotResponse("Microphone access denied. Please enable microphone permissions and refresh the page.");
            setUsingTextInput(true);
            break;
          case 'aborted':
            // User aborted, don't show error
            break;
          default:
            setBotResponse(`Error: ${event.error}. Please try again or type your message.`);
            setUsingTextInput(true);
        }
      };
      
      speechRecognitionRef.current = recognition;
      return true;
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      return false;
    }
  };

  // Function to get response from Gemini API
  const getGeminiResponse = async (message) => {
    console.log("Getting Gemini response for:", message);
    setIsLoading(true);
    setApiError(null);
    
    // Check for special navigation commands first
    if (message.toLowerCase().includes("game") || message.toLowerCase().includes("play")) {
      window.location.href = "/otherJS/carGame/games.html";
      return;
    } else if (message.toLowerCase().includes("exercise")) {
      window.location.href = "../otherHTML/exercise.html";
      return;
    } else if (message.toLowerCase().includes("food")) {
      window.location.href = "/otherHTML/food.html";
      return;
    } else if (message.toLowerCase().includes("statistics") || message.toLowerCase().includes("stats")) {
      window.location.href = "../otherHTML/statistics.html";
      return;
    }

    try {
      // Call Gemini API - FIXED ENDPOINT URL
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`API error (${response.status}):`, errorData);
        throw new Error(`API request failed with status ${response.status}: ${errorData}`);
      }
      
      const data = await response.json();
      console.log("Full Gemini API response:", data);
      
      // Extract text from Gemini response
      let replyText = '';
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        replyText = data.candidates[0].content.parts[0].text;
      } else {
        replyText = "I'm not sure how to respond to that. Can you try asking in a different way?";
      }
      
      console.log("Gemini replied:", replyText);
      
      // Set the bot response to display it - ensure no markdown formatting is preserved
      setBotResponse(replyText.replace(/\*/g, ''));

      // Call speak function after setting response
      setTimeout(() => {
        speak(replyText.replace(/\*/g, ''));
      }, 100);
    } catch (error) {
      console.error("Error getting Gemini response:", error);
      setApiError(error.message);
      const errorMessage = "Sorry, I had trouble connecting to my brain. Please try again in a moment.";
      setBotResponse(errorMessage);
      speak(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Improved text-to-speech function with better error handling
  const speak = (text) => {
    if (!speechSynthesisRef.current) {
      console.error("Speech synthesis not available");
      return;
    }
    
    try {
      // Cancel any ongoing speech
      speechSynthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try getting a specific voice - improved voice selection
      const voices = speechSynthesisRef.current.getVoices();
      console.log("Available voices:", voices.length);
      
      let selectedVoice = null;
      
      // Prioritize natural English voices
      const englishVoices = voices.filter(voice => voice.lang.includes('en'));
      
      // Try to get a good quality voice
      if (englishVoices.length > 0) {
        // Prefer voices that are not "Google" (as they tend to be better quality)
        const preferredVoice = englishVoices.find(voice => 
          !voice.name.includes('Google') && voice.localService === false
        );
        
        selectedVoice = preferredVoice || englishVoices[0];
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log("Using voice:", selectedVoice.name);
      }
      
      // Improve speech parameters
      utterance.rate = 1.0; // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Full volume
      
      // Add event listeners to monitor speech
      utterance.onstart = () => console.log("Speech started");
      utterance.onend = () => console.log("Speech ended");
      utterance.onerror = (event) => {
        console.error("Speech error:", event);
        // Don't show errors to user for speech synthesis issues
      };
      
      // Actually speak
      speechSynthesisRef.current.speak(utterance);
    } catch (error) {
      console.error("Error in speech synthesis:", error);
    }
  };

  // Start listening to user speech with better error handling
  const listenUser = () => {
    // Remove the botReady check that was causing the issue
    // The bot is already set to ready in the useEffect hook
    
    if (!speechSupported) {
      setBotResponse("Speech recognition is not supported in your browser. Please try using Chrome or Edge.");
      setUsingTextInput(true);
      return;
    }
    
    if (speechRecognitionRef.current) {
      try {
        console.log("Starting speech recognition");
        
        // Stop any ongoing speech synthesis
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.cancel();
        }
        
        // Check if already listening and reset if needed
        if (isListening) {
          speechRecognitionRef.current.stop();
          setTimeout(() => {
            startRecognition();
          }, 300);
        } else {
          startRecognition();
        }
        
        // Provide user feedback
        setBotResponse("I'm listening...");
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setUsingTextInput(true);
        setBotResponse("There was an issue with the microphone. Please type your message instead.");
      }
    } else {
      // Try to reinitialize speech recognition
      const supported = initializeSpeechRecognition();
      setSpeechSupported(supported);
      
      if (supported) {
        setTimeout(listenUser, 500); // Try again after initialization
      } else {
        setUsingTextInput(true);
        setBotResponse("Speech recognition is not available. Please type your message instead.");
      }
    }
  };
  
  // Helper function to start recognition with error handling
  const startRecognition = () => {
    try {
      // Set a timeout to potentially avoid network errors
      setTimeout(() => {
        if (speechRecognitionRef.current) {
          speechRecognitionRef.current.start();
        }
      }, 300);
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      if (error.name === 'InvalidStateError') {
        try {
          speechRecognitionRef.current.stop();
          setTimeout(() => {
            speechRecognitionRef.current.start();
          }, 500);
        } catch (e) {
          setUsingTextInput(true);
          setBotResponse("Speech recognition error. Please type your message instead.");
        }
      } else {
        setUsingTextInput(true);
        setBotResponse("Could not access the microphone. Please type your message instead.");
      }
    }
  };

  // Handle text input submission
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      setUserSpeech(textInput);
      getGeminiResponse(textInput);
      setTextInput('');
    }
  };

  // Handle start conversation
  const handleStartConversation = () => {
    setChatStarted(true);
    setCount(prevCount => prevCount + 1);
    
    if (count === 0) {
      // Welcome message on first conversation
      const welcomeMessage = "Hello my friend, I'm happy you're here";
      setBotResponse(welcomeMessage);
      speak(welcomeMessage);
    }
    
    // Focus on text input if using text mode
    if (usingTextInput && textInputRef.current) {
      setTimeout(() => {
        textInputRef.current.focus();
      }, 100);
    }
  };

  // Handle stop conversation
  const handleStopConversation = () => {
    setChatStarted(false);
    setUserSpeech('');
    setTextInput('');
    
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.abort();
      } catch (e) {
        console.error("Error stopping speech recognition:", e);
      }
    }
    
    if (speechSynthesisRef.current) {
      try {
        speechSynthesisRef.current.cancel();
      } catch (e) {
        console.error("Error cancelling speech synthesis:", e);
      }
    }
    
    // Provide feedback that the conversation has stopped
    setBotResponse("Conversation ended. Click 'Start Conversation' to begin again.");
  };

  // Toggle between speech and text input
  const toggleInputMethod = () => {
    setUsingTextInput(!usingTextInput);
    if (!usingTextInput && textInputRef.current) {
      setTimeout(() => {
        textInputRef.current.focus();
      }, 100);
    }
  };

  // Debug button with more comprehensive testing
  const testSpeechRecognition = () => {
    let status = [];
    
    // Check browser support
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      status.push("✅ Speech Recognition API is available in your browser");
    } else {
      status.push("❌ Speech Recognition API is NOT available in your browser");
    }
    
    // Check speech synthesis
    if (window.speechSynthesis) {
      status.push("✅ Speech Synthesis API is available");
      
      // Check voices
      const voices = window.speechSynthesis.getVoices();
      status.push(`📢 ${voices.length} voices found`);
    } else {
      status.push("❌ Speech Synthesis API is NOT available");
    }
    
    // Check instance status
    if (speechRecognitionRef.current) {
      status.push("✅ Speech recognition is initialized");
    } else {
      status.push("❌ Speech recognition is not initialized");
      
      // Try reinitializing
      const supported = initializeSpeechRecognition();
      status.push(supported ? 
        "✅ Successfully reinitialized speech recognition" : 
        "❌ Failed to reinitialize speech recognition");
    }
    
    // Check API key
    status.push(`🔑 Gemini API key: ${geminiApiKey ? "✅ Available" : "❌ Not found"}`);
    
    // Test API key format
    if (geminiApiKey) {
      if (geminiApiKey.startsWith('AI') && geminiApiKey.length > 30) {
        status.push("✅ API key format appears valid");
      } else {
        status.push("⚠️ API key format may not be valid");
      }
    }
    
    // Check connection to prevent common SSL/network issues
    status.push(`🌐 Page protocol: ${window.location.protocol}`);
    if (window.location.protocol !== 'https:') {
      status.push("⚠️ Warning: Speech recognition works best with HTTPS");
    }
    
    // Network status
    status.push(`🌐 Network status: ${navigator.onLine ? 'Online' : 'Offline'}`);
    
    // Show API error if any
    if (apiError) {
      status.push(`❌ Last API error: ${apiError}`);
    }
    
    // Check botReady status
    status.push(`🤖 Bot ready: ${botReady ? '✅ Yes' : '❌ No'}`);
    
    // Check microphone permissions
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' })
        .then(permissionStatus => {
          status.push(`🎤 Microphone permission: ${permissionStatus.state}`);
          alert(status.join('\n'));
        })
        .catch(error => {
          status.push(`❌ Error checking microphone permission: ${error.message}`);
          alert(status.join('\n'));
        });
    } else {
      status.push("⚠️ Cannot check microphone permissions");
      alert(status.join('\n'));
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#dce1e3] pt-8">
      <div className="back-to-home absolute top-4 left-4">
        <a href="../index.html">
          <h1 className="text-2xl"><i className="fas fa-long-arrow-alt-right"></i></h1>
        </a>
      </div>
      
      <div className="whole-bot-cont max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="the-head text-center mb-6">
          <p className="text-2xl font-bold">I'm Here for you &lt;3</p>
        </div>
        
        <div className="bot-cont flex flex-col items-center">
          <div className="bot-img-cont mb-6">
            <img 
              src="/images/Chatbot/chatbot.png" 
              alt="Bot character" 
              className="w-48 h-48"
            />
          </div>
          
          {/* Conversation Display Area */}
          <div className="conversation-area w-full mb-4">
            {/* User's speech bubble - always show when listening or text exists */}
            {(isListening || userSpeech) && (
              <div className="user-speech-container bg-gray-100 p-3 rounded-lg w-full mb-3">
                <p className="text-sm text-gray-500 mb-1">You:</p>
                <p className="user-speech text-gray-800">
                  {userSpeech || (isListening ? "Listening..." : "")}
                </p>
              </div>
            )}
            
            {/* Bot's response bubble */}
            {botResponse && (
              <div className="bot-response-container bg-blue-100 p-3 rounded-lg w-full">
                <p className="text-sm text-gray-500 mb-1">Bot:</p>
                <p className="bot-response text-gray-800">
                  {isLoading ? "Thinking..." : botResponse}
                </p>
              </div>
            )}
            
            {/* API Error display */}
            {apiError && (
              <div className="api-error-container bg-red-100 p-2 rounded-lg w-full mt-2 text-xs">
                <p className="text-red-600">Error: {apiError}</p>
              </div>
            )}
          </div>
          
          {/* Text input for fallback */}
          {chatStarted && usingTextInput && (
            <form onSubmit={handleTextSubmit} className="w-full mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ref={textInputRef}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-r-md`}
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "Send"}
                </button>
              </div>
            </form>
          )}
          
          <div className="bot-page-btns w-full">
            {!chatStarted ? (
              <div className="start-convo-btn-cont">
                <button 
                  className="start-convo-btn btn bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors w-full"
                  onClick={handleStartConversation}
                  disabled={!geminiApiKey}
                >
                  {!geminiApiKey ? "Missing API key" : "Start Conversation"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 w-full mb-4">
                <div className="flex space-x-2 w-full">
                  {!usingTextInput && (
                    <button 
                      className={`speak-btn btn ${isListening ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white font-medium py-2 px-4 rounded-md transition-colors flex-1`}
                      onClick={listenUser}
                      disabled={isListening || isLoading}
                    >
                      {isListening ? "Listening..." : isLoading ? "Processing..." : "Listen to me"}
                    </button>
                  )}
                  <button 
                    className="stop-convo-btn btn bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex-1"
                    onClick={handleStopConversation}
                    disabled={isLoading}
                  >
                    Stop Conversation
                  </button>
                </div>
                
                {/* Toggle button */}
                <button
                  className="toggle-input-btn bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors w-full"
                  onClick={toggleInputMethod}
                  disabled={isLoading}
                >
                  Switch to {usingTextInput ? "Talk" : "Chat"}
                </button>
              </div>
            )}
          </div>
          
          {/* Development help button - Test Speech only */}
          <div className="flex mt-2">
            <button 
              className="test-btn btn bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium py-1 px-2 rounded-md transition-colors"
              onClick={testSpeechRecognition}
            >
              Test Speech
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;