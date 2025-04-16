import { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Access the API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ExercisePlanner = () => {
  // User data states
  const [userData, setUserData] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "female",
    fitnessLevel: "beginner",
    goal: "strength",
    equipmentAccess: [],
    healthConditions: "",
    timePerDay: "30",
    submitted: false
  });

  // Exercise plan state
  const [exercisePlan, setExercisePlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);

  // Equipment access options
  const equipmentOptions = [
    { id: "none", label: "no equipment" },
    { id: "dumbbells", label: "dumbbells" },
    { id: "resistance-bands", label: "resistance bands" },
    { id: "gym", label: "full gym access" },
    { id: "cardio-machines", label: "cardio machines" },
    { id: "yoga-mat", label: "yoga mat" }
  ];

  // Fitness goals options
  const fitnessGoals = [
    { value: "strength", label: "build strength" },
    { value: "weightloss", label: "weight loss" },
    { value: "endurance", label: "improve endurance" },
    { value: "flexibility", label: "increase flexibility" },
    { value: "muscle", label: "build muscle" },
    { value: "general", label: "general fitness" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleCheckboxChange = (id) => {
    const updatedEquipment = userData.equipmentAccess.includes(id)
      ? userData.equipmentAccess.filter(item => item !== id)
      : [...userData.equipmentAccess, id];
    
    setUserData({
      ...userData,
      equipmentAccess: updatedEquipment
    });
  };

  const generateExercisePlanPrompt = () => {
    const equipment = userData.equipmentAccess.length > 0 
                       ? userData.equipmentAccess.join(", ")
                       : "no equipment";
    
    return `Create a comprehensive 7-day exercise plan for someone with the following characteristics:
    - Height: ${userData.height} cm
    - Weight: ${userData.weight} kg
    - Age: ${userData.age}
    - Gender: ${userData.gender}
    - Fitness level: ${userData.fitnessLevel}
    - Primary fitness goal: ${userData.goal}
    - Time available per day: ${userData.timePerDay} minutes
    - Equipment access: ${equipment}
    - Health conditions/limitations: ${userData.healthConditions || "none"}
    
    For EACH of the 7 days, include:
    1. Day number and focus (e.g., "day 1: upper body strength" - use lowercase)
    2. Brief warm-up routine
    3. Main workout with:
       a. Exercise names in lowercase (not uppercase)
       b. Sets and reps or duration
       c. Brief form guidance
       d. Expected intensity level
    4. Cool-down stretches
    5. Mental wellness tip related to exercise
    
    Make the workouts progressive across the week, with appropriate rest days or lower intensity days as needed.
    
    Format each exercise clearly with consistent structure. Use the exact formatting below for each exercise:

    exercise name (lowercase)
    sets/duration: X sets of Y reps or Z minutes
    form guide: Brief form guidance
    intensity: low/medium/high
    
    Do not include any asterisks, stars, or other special characters in your response.`;
  };

  const fetchExercisePlan = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const prompt = generateExercisePlanPrompt();
      
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY
          }
        }
      );
      
      const generatedText = response.data.candidates[0].content.parts[0].text;
      
      // Process the generated text to enhance formatting
      const processedText = processExercisePlanText(generatedText);
      setExercisePlan(processedText);
    } catch (err) {
      console.error("Error fetching exercise plan:", err);
      setError("failed to generate exercise plan. please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Process function to handle Gemini API's inconsistent formatting
  const processExercisePlanText = (text) => {
    // Clean up any special characters or formatting issues
    let cleanText = text
      .replace(/\*+/g, '') // Remove asterisks
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Split by days
    const days = [];
    const dayRegex = /day \d+:?.*?(?=(day \d+|$))/gis;
    let match;
    
    while ((match = dayRegex.exec(cleanText)) !== null) {
      days.push(match[0].trim());
    }

    // If we couldn't split properly, return the original text
    if (days.length === 0) return [cleanText];
    
    return days;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserData({...userData, submitted: true});
    fetchExercisePlan();
  };

  const resetForm = () => {
    setUserData({
      height: "",
      weight: "",
      age: "",
      gender: "female",
      fitnessLevel: "beginner",
      goal: "strength",
      equipmentAccess: [],
      healthConditions: "",
      timePerDay: "30",
      submitted: false
    });
    setExercisePlan(null);
    setSelectedDay(0);
  };

  // PDF Generation Function
  const generatePDF = () => {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Set fonts and add title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Your 7-Day Exercise Plan", 105, 20, { align: "center" });
    
    // Add user profile information
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Fitness Profile:", 14, 35);
    
    doc.setFontSize(10);
    doc.text(`Height: ${userData.height} cm | Weight: ${userData.weight} kg | Age: ${userData.age} | Gender: ${userData.gender}`, 14, 42);
    doc.text(`Fitness Level: ${userData.fitnessLevel} | Goal: ${fitnessGoals.find(g => g.value === userData.goal)?.label}`, 14, 48);
    
    const equipment = userData.equipmentAccess.length > 0 
      ? userData.equipmentAccess.map(eq => {
          const option = equipmentOptions.find(opt => opt.id === eq);
          return option ? option.label : eq;
        }).join(", ")
      : "no equipment";
      
    doc.text(`Available Time: ${userData.timePerDay} minutes daily | Equipment: ${equipment}`, 14, 54);
    
    if (userData.healthConditions) {
      doc.text(`Health Considerations: ${userData.healthConditions}`, 14, 60);
    }
    
    let yPosition = userData.healthConditions ? 70 : 64;
    
    // Add each day's exercise plan
    if (exercisePlan && exercisePlan.length > 0) {
      for (let i = 0; i < exercisePlan.length; i++) {
        // Check if we need to add a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Extract the day title/focus
        const dayText = exercisePlan[i];
        const dayTitleMatch = dayText.match(/day\s*(\d+):?\s*(.*?)(?=\n|$)/i);
        const dayTitle = dayTitleMatch 
          ? `Day ${dayTitleMatch[1]}${dayTitleMatch[2] ? ': ' + dayTitleMatch[2].toLowerCase() : ''}`
          : `Day ${i+1}`;
        
        // Add day title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(dayTitle, 14, yPosition);
        yPosition += 6;
        
        // Clean the text for PDF
        let cleanText = dayText
          .replace(/day\s*\d+:?\s*.*?\n/i, '') // Remove the day title as we've already added it
          .replace(/<[^>]*>/g, '') // Remove any HTML tags
          .replace(/\*+/g, '') // Remove asterisks
          .trim();
        
        // Format the text for PDF
        const sections = cleanText.split(/\b(warm-up|warm up|main workout|cool-down|cool down|stretching|mental wellness tip)(?:\s*:|\s*\n)/i);
        
        for (let j = 0; j < sections.length; j++) {
          // Check if we need to add a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          const section = sections[j].trim();
          
          if (section.match(/\b(warm-up|warm up|main workout|cool-down|cool down|stretching|mental wellness tip)/i)) {
            // This is a section heading
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(section.toLowerCase(), 14, yPosition);
            yPosition += 5;
          } else if (section.length > 0) {
            // This is section content
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            
            // Split text into lines/paragraphs
            const lines = section.split('\n');
            lines.forEach(line => {
              const trimmedLine = line.trim();
              if (trimmedLine.length > 0) {
                // Check if we need to add a new page
                if (yPosition > 270) {
                  doc.addPage();
                  yPosition = 20;
                }
                
                // Format exercise names if present
                if (trimmedLine.match(/sets\/duration|form guide|intensity/i)) {
                  // This is an exercise detail, indent it
                  const splitIndex = trimmedLine.indexOf(':');
                  if (splitIndex > -1) {
                    const label = trimmedLine.substring(0, splitIndex + 1);
                    const content = trimmedLine.substring(splitIndex + 1);
                    
                    doc.setFont("helvetica", "bold");
                    doc.text(label.toLowerCase(), 18, yPosition);
                    doc.setFont("helvetica", "normal");
                    doc.text(content.toLowerCase(), 18 + doc.getTextWidth(label), yPosition);
                  } else {
                    doc.text(trimmedLine.toLowerCase(), 18, yPosition);
                  }
                } else {
                  doc.text(trimmedLine.toLowerCase(), 14, yPosition);
                }
                
                yPosition += 5;
              }
            });
            
            yPosition += 3; // Add some space after each section
          }
        }
        
        yPosition += 8; // Add space between days
      }
    }
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`mindful movement - your personalized exercise plan - page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    }
    
    // Save the PDF
    doc.save("mindful-movement-7-day-exercise-plan.pdf");
  };

  // Updated formatting function for lowercase text and smaller sizing
  const formatExercisePlanDay = (dayText) => {
    if (!dayText) return null;
    
    // Clean up the text first
    let formattedText = dayText
      .replace(/\*+/g, '') // Remove asterisks
      .trim();
    
    // Ensure all text is lowercase
    formattedText = formattedText.toLowerCase();
    
    // Format day title
    formattedText = formattedText.replace(/day\s*(\d+):?\s*(.*?)(?=\n|$)/i, (match, day, title) => {
      return `<h2 class="text-lg font-medium text-teal-700 border-b border-teal-300 pb-2 mb-4">day ${day}${title ? ': ' + title.toLowerCase() : ''}</h2>`;
    });
    
    // Format section titles (warm-up, main workout, etc.)
    formattedText = formattedText.replace(/\b(warm-up|warm up|main workout|cool-down|cool down|stretching|mental wellness tip)(?:\s*:|\s*\n)/gi, 
      match => `<h3 class="text-sm font-medium text-teal-600 mt-4 mb-2 pb-1 border-b border-teal-100">${match.replace(/:/g, '').trim().toLowerCase()}</h3>`);
    
    // Format exercise names with smaller text
    formattedText = formattedText.replace(/([a-z][a-z\s&-]+)(?=\s*\n|\s*sets|\s*duration|\s*reps)/g, 
      match => `<div class="text-sm font-medium text-teal-500 mt-3 mb-1">${match.trim().toLowerCase()}</div>`);
    
    // Format "Sets/Duration:" label and content
    formattedText = formattedText.replace(/\b(sets|sets:|sets\/duration|sets\/duration:|duration|duration:|reps|reps:)\s*(.*?)(?=\bform|\bintensity|\n\n|\n[a-z]|$)/gi, 
      (match, label, content) => 
        `<div class="mb-1 ml-3"><span class="text-xs font-medium text-gray-500">sets/duration:</span> <span class="text-xs text-gray-600">${content.trim().toLowerCase()}</span></div>`);
    
    // Format "Form Guide:" label and content
    formattedText = formattedText.replace(/\b(form guide|form guide:|form|form:)\s*(.*?)(?=\bintensity|\n\n|\n[a-z]|$)/gi, 
      (match, label, content) => 
        `<div class="mb-1 ml-3"><span class="text-xs font-medium text-gray-500">form guide:</span> <span class="text-xs text-gray-600">${content.trim().toLowerCase()}</span></div>`);
    
    // Format "Intensity:" label and value with smaller text
    formattedText = formattedText.replace(/\b(intensity|intensity:)\s*(low|medium|high|moderate)/gi, 
      (match, label, value) => {
        const intensityClass = 
          value.toLowerCase() === 'high' ? 'text-red-500 font-medium text-xs' :
          value.toLowerCase() === 'medium' || value.toLowerCase() === 'moderate' ? 'text-yellow-500 font-medium text-xs' :
          'text-green-500 font-medium text-xs';
        
        return `<div class="mb-3 ml-3"><span class="text-xs font-medium text-gray-500">intensity:</span> <span class="${intensityClass}">${value.toLowerCase()}</span></div>`;
      });
    
    // Format paragraphs in warm-up, cool-down, and mental wellness sections
    formattedText = formattedText.replace(/(?<=<h3[^>]*>(?:warm-up|warm up|cool-down|cool down|mental wellness tip)<\/h3>)([^<]+)(?=<div|<h3|$)/gs, 
      match => {
        if (!match.includes('<div')) {  
          return `<div class="text-xs text-gray-600 mb-3 ml-2 pl-2 border-l border-teal-100">${match.trim().toLowerCase()}</div>`;
        }
        return match;
      });
    
    // Add card styling to each exercise block with smaller padding and text
    formattedText = formattedText.replace(/<div class="text-sm font-medium text-teal-500 mt-3 mb-1">(.*?)<\/div>([\s\S]*?)(?=<div class="text-sm font-medium text-teal-500|<h3|$)/g, 
      (match, exerciseName, details) => {
        return `<div class="bg-gray-50 rounded p-2 mb-3 shadow-sm border-l-2 border-teal-300">
          <div class="text-sm font-medium text-teal-500 mb-1">${exerciseName}</div>
          ${details}
        </div>`;
      });
    
    // Add spacing between sections
    formattedText = formattedText.replace(/\n\n/g, '<div class="my-2"></div>');
    
    return formattedText;
  };
  
  // Days of the week tabs with smaller styling
  const renderDayTabs = () => {
    if (!exercisePlan || exercisePlan.length === 0) return null;
    
    const numDays = exercisePlan.length > 7 ? 7 : exercisePlan.length;
    
    return (
      <div className="flex overflow-x-auto space-x-1 mb-4">
        {Array.from({ length: numDays }).map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedDay(index)}
            className={`px-3 py-2 text-xs font-medium rounded whitespace-nowrap transition-all duration-200
              ${selectedDay === index 
                ? 'bg-teal-400 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-500'}`}
          >
            day {index + 1}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-8">
      {/* Header with lowercase styling */}
      <div className="bg-gray-100 pt-6 pb-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-medium text-gray-800">
            mindful <span className="font-normal">movement</span>
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            regular <span className="text-teal-400">exercise</span> is not just about physical health - it's a powerful tool for mental wellbeing.
          </p>
          <p className="mt-1 text-sm text-gray-600">
            our exercise planner creates personalized workout routines that align with your fitness goals, equipment access, and time availability.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form Section */}
          <div className={`lg:w-1/2 ${userData.submitted ? 'lg:block hidden' : ''}`}>
            <div className="bg-white p-5 rounded shadow-md">
              <h2 className="text-lg font-medium text-gray-700 mb-4">your fitness profile</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1" htmlFor="height">height (cm)</label>
                    <input
                      id="height"
                      name="height"
                      type="number"
                      value={userData.height}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-400"
                      placeholder="height in cm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1" htmlFor="weight">weight (kg)</label>
                    <input
                      id="weight"
                      name="weight"
                      type="number"
                      value={userData.weight}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-400"
                      placeholder="weight in kg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1" htmlFor="age">age</label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      value={userData.age}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-400"
                      placeholder="your age"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1" htmlFor="gender">gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={userData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-400"
                    >
                      <option value="female">female</option>
                      <option value="male">male</option>
                      <option value="other">other</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1" htmlFor="fitnessLevel">fitness level</label>
                    <select
                      id="fitnessLevel"
                      name="fitnessLevel"
                      value={userData.fitnessLevel}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-400"
                    >
                      <option value="beginner">beginner</option>
                      <option value="intermediate">intermediate</option>
                      <option value="advanced">advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1" htmlFor="timePerDay">available time (min/day)</label>
                    <select
                      id="timePerDay"
                      name="timePerDay"
                      value={userData.timePerDay}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-400"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90+ minutes</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1" htmlFor="goal">primary fitness goal</label>
                  <select
                    id="goal"
                    name="goal"
                    value={userData.goal}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-400"
                  >
                    {fitnessGoals.map(goal => (
                      <option key={goal.value} value={goal.value}>{goal.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">equipment access</label>
                  <div className="grid grid-cols-2 gap-2">
                    {equipmentOptions.map(option => (
                      <div key={option.id} className="flex items-center">
                        <input
                          id={option.id}
                          type="checkbox"
                          checked={userData.equipmentAccess.includes(option.id)}
                          onChange={() => handleCheckboxChange(option.id)}
                          className="h-4 w-4 text-teal-400 focus:ring-teal-300 border-gray-300 rounded"
                        />
                        <label htmlFor={option.id} className="ml-2 text-xs text-gray-600">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1" htmlFor="healthConditions">
                    health conditions or limitations (optional)
                  </label>
                  <textarea
                    id="healthConditions"
                    name="healthConditions"
                    value={userData.healthConditions}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-400"
                    placeholder="e.g., knee injury, lower back pain, pregnancy, etc."
                    rows="2"
                  ></textarea>
                </div>
                
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="bg-teal-400 hover:bg-teal-500 text-white text-sm font-medium py-2 px-5 rounded transition duration-300 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:ring-offset-1"
                  >
                    create my 7-day exercise plan
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Results Section */}
          <div className={`${userData.submitted ? 'lg:w-1/2 w-full' : 'hidden'}`}>
            <div className="bg-white p-5 rounded shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-700">your 7-day exercise plan</h2>
                <button
                  onClick={resetForm}
                  className="text-xs text-teal-400 hover:text-teal-500 font-medium"
                >
                  create new plan
                </button>
              </div>
              
              {loading && (
                <div className="flex flex-col items-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
                  <p className="mt-3 text-xs text-gray-500">creating your personalized 7-day exercise plan...</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border-l-2 border-red-400 p-3 my-3">
                  <p className="text-xs text-red-600">{error}</p>
                  <button 
                    onClick={fetchExercisePlan}
                    className="mt-2 text-xs text-red-600 font-medium hover:text-red-700"
                  >
                    try again
                  </button>
                </div>
              )}
              
              {exercisePlan && !loading && (
                <div className="exercise-plan">
                  <div className="p-3 bg-teal-50 rounded mb-4 border border-teal-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium text-teal-600">fitness level:</span><br />
                          <span className="text-gray-700">{userData.fitnessLevel}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium text-teal-600">primary goal:</span><br />
                          <span className="text-gray-700">{fitnessGoals.find(g => g.value === userData.goal)?.label}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium text-teal-600">daily time:</span><br />
                          <span className="text-gray-700">{userData.timePerDay} minutes</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium text-teal-600">equipment:</span><br />
                          <span className="text-gray-700">
                          {userData.equipmentAccess.length > 0 
                              ? userData.equipmentAccess.map(eq => {
                                  const option = equipmentOptions.find(opt => opt.id === eq);
                                  return option ? option.label : eq;
                                }).join(", ")
                              : "no equipment"
                            }
                          </span>
                        </p>
                      </div>
                    </div>
                    {userData.healthConditions && (
                      <div className="mt-2 pt-2 border-t border-teal-100">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium text-teal-600">accommodations for:</span> {userData.healthConditions.toLowerCase()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Download PDF button */}
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={generatePDF}
                      className="flex items-center bg-teal-50 hover:bg-teal-100 text-teal-600 text-xs font-medium py-2 px-4 rounded border border-teal-200 transition duration-300 focus:outline-none focus:ring-1 focus:ring-teal-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      download 7-day plan as pdf
                    </button>
                  </div>
                  
                  {/* Day tabs navigation */}
                  {renderDayTabs()}
                  
                  {/* Render the selected day's exercise plan with smaller, lowercase styling */}
                  <div className="bg-white rounded p-3 border border-gray-100">
                    {exercisePlan && exercisePlan[selectedDay] && (
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: formatExercisePlanDay(exercisePlan[selectedDay]) 
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="mt-6 p-3 bg-teal-50 rounded border border-teal-100">
                    <h3 className="text-sm font-medium text-teal-600 mb-2">exercise & mental wellness</h3>
                    <p className="text-xs text-gray-600">
                      regular physical activity helps reduce stress, anxiety, and depression while boosting 
                      mood and cognitive function. this plan is designed to support both your physical fitness 
                      goals and mental wellbeing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* If no form submitted yet, show illustration */}
          {!userData.submitted && (
            <div className="lg:w-1/2 flex justify-center items-center">
              <div className="max-w-md">
                <img 
                  src="/images/FoodAndExcersize/Exercise.png" 
                  alt="exercise illustration" 
                  className="w-full rounded shadow-md"
                />
                <div className="text-center mt-3">
                  <p className="text-xs text-gray-500 italic">
                    "physical fitness is not only one of the most important keys to a healthy body, it is the basis of dynamic and creative intellectual activity"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExercisePlanner;