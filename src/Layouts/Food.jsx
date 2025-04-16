import { useState, useRef } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';

// Access the API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const MealPlanner = () => {
  // User data states
  const [userData, setUserData] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "female",
    activityLevel: "moderate",
    goal: "maintain",
    dietaryPreferences: [],
    submitted: false
  });

  // Diet plan state
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  
  // Ref for PDF content
  const pdfRef = useRef(null);

  // Dietary preferences options
  const dietaryOptions = [
    { id: "vegetarian", label: "Vegetarian" },
    { id: "vegan", label: "Vegan" },
    { id: "gluten-free", label: "Gluten Free" },
    { id: "dairy-free", label: "Dairy Free" },
    { id: "keto", label: "Keto Friendly" },
    { id: "paleo", label: "Paleo" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleCheckboxChange = (id) => {
    const updatedPreferences = userData.dietaryPreferences.includes(id)
      ? userData.dietaryPreferences.filter(item => item !== id)
      : [...userData.dietaryPreferences, id];
    
    setUserData({
      ...userData,
      dietaryPreferences: updatedPreferences
    });
  };

  const calculateBMR = () => {
    // Basic BMR calculation using Harris-Benedict equation
    const weight = parseFloat(userData.weight);
    const height = parseFloat(userData.height);
    const age = parseFloat(userData.age);
    
    if (userData.gender === "female") {
      return 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
    } else {
      return 66.47 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
    }
  };

  const calculateCalories = () => {
    const bmr = calculateBMR();
    let calorieNeeds = 0;
    
    // Activity level multiplier
    switch (userData.activityLevel) {
      case "sedentary":
        calorieNeeds = bmr * 1.2;
        break;
      case "light":
        calorieNeeds = bmr * 1.375;
        break;
      case "moderate":
        calorieNeeds = bmr * 1.55;
        break;
      case "active":
        calorieNeeds = bmr * 1.725;
        break;
      case "very-active":
        calorieNeeds = bmr * 1.9;
        break;
      default:
        calorieNeeds = bmr * 1.2;
    }
    
    // Goal adjustment
    switch (userData.goal) {
      case "lose":
        calorieNeeds -= 500; // Deficit for weight loss
        break;
      case "gain":
        calorieNeeds += 500; // Surplus for weight gain
        break;
      default:
        // Maintain weight - no adjustment needed
        break;
    }
    
    return Math.round(calorieNeeds);
  };

  const generateDietPlanPrompt = () => {
    const calories = calculateCalories();
    const dietaryRestrictions = userData.dietaryPreferences.join(", ");
    
    return `Create a comprehensive 7-day meal plan for someone with the following characteristics:
    - Height: ${userData.height} cm
    - Weight: ${userData.weight} kg
    - Age: ${userData.age}
    - Gender: ${userData.gender}
    - Activity level: ${userData.activityLevel}
    - Goal: ${userData.goal === "lose" ? "lose weight" : userData.goal === "gain" ? "gain weight" : "maintain weight"}
    - Daily calorie needs: approximately ${calories} calories
    - Dietary preferences/restrictions: ${dietaryRestrictions || "none"}
    
    For EACH of the 7 days, include:
    1. Day number and title (e.g., "DAY 1: ENERGIZING START")
    2. For each meal (breakfast, lunch, dinner, and two snacks):
       a. Name of the dish (in UPPERCASE)
       b. Brief list of ingredients
       c. Approximate calories
       d. Key nutrients that support mental health (omega-3, magnesium, B vitamins, etc.)
    
    Make the meals varied across the week but practical to prepare. Focus on foods that have proven benefits for mental wellbeing.
    
    Format each day clearly with consistent structure. Use the exact formatting below for each meal:

    MEAL NAME
    Ingredients: ingredient1, ingredient2, etc.
    Calories: XXX kcal
    Mental Health Benefits: benefit1, benefit2, etc.

    Do not include any asterisks, stars, or other special characters in your response.`;
  };

  const fetchDietPlan = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const prompt = generateDietPlanPrompt();
      
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
      const processedText = processMealPlanText(generatedText);
      setDietPlan(processedText);
    } catch (err) {
      console.error("Error fetching diet plan:", err);
      setError("Failed to generate diet plan. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Improved process function to handle Gemini API's inconsistent formatting
  const processMealPlanText = (text) => {
    // Clean up any special characters or formatting issues
    let cleanText = text
      .replace(/\*+/g, '') // Remove asterisks
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Split by days
    const days = [];
    const dayRegex = /DAY \d+:?.*?(?=(DAY \d+|$))/gis;
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
    fetchDietPlan();
  };

  const resetForm = () => {
    setUserData({
      height: "",
      weight: "",
      age: "",
      gender: "female",
      activityLevel: "moderate",
      goal: "maintain",
      dietaryPreferences: [],
      submitted: false
    });
    setDietPlan(null);
    setSelectedDay(0);
  };

  // Improved formatting function with better regex patterns
  const formatMealPlanDay = (dayText) => {
    if (!dayText) return null;
    
    // Clean up the text first
    let formattedText = dayText
      .replace(/\*+/g, '') // Remove asterisks
      .trim();
    
    // Format day title
    formattedText = formattedText.replace(/DAY\s*(\d+):?\s*(.*?)(?=\n|$)/i, (match, day, title) => {
      return `<h2 class="text-2xl font-bold text-teal-800 border-b-2 border-teal-500 pb-2 mb-4">DAY ${day}${title ? ': ' + title.toUpperCase() : ''}</h2>`;
    });
    
    // Format meal titles (BREAKFAST, LUNCH, etc.)
    formattedText = formattedText.replace(/\b(BREAKFAST|LUNCH|DINNER|SNACK(?:\s\d+|)|MORNING SNACK|AFTERNOON SNACK|EVENING SNACK)(?:\s*:|\s*\n)/gi, 
      match => `<h3 class="text-xl font-bold text-teal-700 mt-4 mb-2">${match.replace(/:/g, '').trim().toUpperCase()}</h3>`);
    
    // Format meal names (usually in uppercase or followed by colon)
    formattedText = formattedText.replace(/([A-Z][A-Z\s&-]+)(?=\s*\n|\s*Ingredients)/g, 
      match => `<div class="font-bold text-gray-800 mb-2">${match.trim()}</div>`);
    
    // Format "Ingredients:" label and content
    formattedText = formattedText.replace(/\b(Ingredients|Ingredients:)\s*(.*?)(?=\bCalories|\bMental Health|\n\n|\n[A-Z]|$)/gi, 
      (match, label, content) => 
        `<div class="mb-1"><span class="font-semibold text-gray-700">Ingredients:</span> ${content.trim()}</div>`);
    
    // Format "Calories:" label and value
    formattedText = formattedText.replace(/\b(Calories|Calories:)\s*(\d+)(\s*kcal)?/gi, 
      (match, label, value, unit) => 
        `<div class="mb-1"><span class="font-semibold text-gray-700">Calories:</span> <span class="text-teal-600 font-medium">${value}${unit || ' kcal'}</span></div>`);
    
    // Format "Mental Health Benefits:" or "Key Nutrients:" label and content
    formattedText = formattedText.replace(/\b(Key Nutrients|Key Nutrients:|Mental Health Benefits|Mental Health Benefits:)\s*(.*?)(?=\n\n|\n[A-Z]|$)/gi, 
      (match, label, content) => 
        `<div class="mb-3"><span class="font-semibold text-gray-700">Mental Health Benefits:</span> ${content.trim()}</div>`);
    
    // Add spacing between sections
    formattedText = formattedText.replace(/\n\n/g, '<div class="my-3"></div>');
    
    return formattedText;
  };

  // Days of the week tabs with more appealing styling
  const renderDayTabs = () => {
    if (!dietPlan || dietPlan.length === 0) return null;
    
    const numDays = dietPlan.length > 7 ? 7 : dietPlan.length;
    
    return (
      <div className="flex overflow-x-auto space-x-1 mb-4 pb-2 border-b border-gray-200">
        {Array.from({ length: numDays }).map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedDay(index)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap
              ${selectedDay === index 
                ? 'bg-teal-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Day {index + 1}
          </button>
        ))}
      </div>
    );
  };

  // Create PDF function
  const generatePDF = () => {
    if (!dietPlan) return;

    // Create a new element for PDF content
    const pdfContent = document.createElement('div');
    pdfContent.classList.add('pdf-content');
    pdfContent.style.padding = '20px';
    pdfContent.style.fontFamily = 'Arial, sans-serif';

    // Add header
    const header = document.createElement('div');
    header.innerHTML = `
      <h1 style="text-align: center; color: #0d9488; margin-bottom: 20px; font-size: 24px;">7-Day Personalized Meal Plan</h1>
      <div style="background-color: #f0fdfa; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <p><strong>Daily Calorie Target:</strong> ~${calculateCalories()} calories</p>
        ${userData.dietaryPreferences.length > 0 ? 
          `<p><strong>Dietary Preferences:</strong> ${userData.dietaryPreferences.map(pref => {
            const option = dietaryOptions.find(opt => opt.id === pref);
            return option ? option.label : pref;
          }).join(", ")}</p>` : ''}
        <p><strong>Created for:</strong> ${userData.gender === 'female' ? 'Female' : userData.gender === 'male' ? 'Male' : 'Other'}, ${userData.age} years, ${userData.height} cm, ${userData.weight} kg</p>
        <p><strong>Activity level:</strong> ${userData.activityLevel}</p>
        <p><strong>Goal:</strong> ${userData.goal === 'lose' ? 'Weight loss' : userData.goal === 'gain' ? 'Weight gain' : 'Weight maintenance'}</p>
      </div>
    `;
    pdfContent.appendChild(header);

    // Add each day's meal plan
    dietPlan.forEach((day, index) => {
      const dayElement = document.createElement('div');
      dayElement.style.pageBreakInside = 'avoid';
      dayElement.style.marginBottom = '30px';
      
      // Convert HTML formatting to simpler formatting for PDF
      let dayContent = day
        .replace(/DAY\s*(\d+):?\s*(.*?)(?=\n|$)/i, (match, day, title) => {
          return `<h2 style="font-size: 20px; color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 8px; margin-bottom: 16px;">DAY ${day}${title ? ': ' + title.toUpperCase() : ''}</h2>`;
        });
      
      // Format meal titles
      dayContent = dayContent.replace(/\b(BREAKFAST|LUNCH|DINNER|SNACK(?:\s\d+|)|MORNING SNACK|AFTERNOON SNACK|EVENING SNACK)(?:\s*:|\s*\n)/gi, 
        match => `<h3 style="font-size: 18px; color: #0f766e; margin-top: 16px; margin-bottom: 8px;">${match.replace(/:/g, '').trim().toUpperCase()}</h3>`);
      
      // Format meal names
      dayContent = dayContent.replace(/([A-Z][A-Z\s&-]+)(?=\s*\n|\s*Ingredients)/g, 
        match => `<div style="font-weight: bold; color: #374151; margin-bottom: 8px;">${match.trim()}</div>`);
      
      // Format "Ingredients:" label and content
      dayContent = dayContent.replace(/\b(Ingredients|Ingredients:)\s*(.*?)(?=\bCalories|\bMental Health|\n\n|\n[A-Z]|$)/gi, 
        (match, label, content) => 
          `<div style="margin-bottom: 4px;"><span style="font-weight: 600; color: #4b5563;">Ingredients:</span> ${content.trim()}</div>`);
      
      // Format "Calories:" label and value
      dayContent = dayContent.replace(/\b(Calories|Calories:)\s*(\d+)(\s*kcal)?/gi, 
        (match, label, value, unit) => 
          `<div style="margin-bottom: 4px;"><span style="font-weight: 600; color: #4b5563;">Calories:</span> <span style="color: #0d9488; font-weight: 500;">${value}${unit || ' kcal'}</span></div>`);
      
      // Format "Mental Health Benefits:" or "Key Nutrients:" label and content
      dayContent = dayContent.replace(/\b(Key Nutrients|Key Nutrients:|Mental Health Benefits|Mental Health Benefits:)\s*(.*?)(?=\n\n|\n[A-Z]|$)/gi, 
        (match, label, content) => 
          `<div style="margin-bottom: 12px;"><span style="font-weight: 600; color: #4b5563;">Mental Health Benefits:</span> ${content.trim()}</div>`);
      
      // Add spacing between sections
      dayContent = dayContent.replace(/\n\n/g, '<div style="margin: 12px 0;"></div>');
      
      dayElement.innerHTML = dayContent;
      pdfContent.appendChild(dayElement);
      
      // Add page break after each day except the last one
      if (index < dietPlan.length - 1) {
        const pageBreak = document.createElement('div');
        pageBreak.style.pageBreakAfter = 'always';
        pageBreak.style.height = '10px';
        pdfContent.appendChild(pageBreak);
      }
    });

    // Add footer
    const footer = document.createElement('div');
    footer.style.marginTop = '30px';
    footer.style.borderTop = '1px solid #e2e8f0';
    footer.style.paddingTop = '15px';
    footer.style.textAlign = 'center';
    footer.style.color = '#6b7280';
    footer.style.fontSize = '14px';
    footer.innerHTML = `<p>This meal plan was generated to support both physical and mental wellbeing.</p>
      <p>© ${new Date().getFullYear()} Mindful Nutrition - Generated on ${new Date().toLocaleDateString()}</p>`;
    pdfContent.appendChild(footer);
    
    // Generate the PDF
    const pdfOptions = {
      margin: 15,
      filename: '7-Day-Meal-Plan.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().from(pdfContent).set(pdfOptions).save();
  };

  return (
    <div className="bg-[#dce1e3] min-h-screen pb-12">
      {/* Header with styling matching the image */}
      <div className="bg-[#dce1e3] pt-8 pb-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Mindful <span className="font-normal">Nutrition</span>
          </h1>
          <p className="mt-4 text-gray-700">
            Take your time <span className="text-teal-500">nourishing</span> your body. What you eat plays a critical role in how you feel mentally and physically.
          </p>
          <p className="mt-2 text-gray-700">
            Our meal planner is designed to help you create nutritionally balanced meals that support both your mental wellbeing and physical goals.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section */}
          <div className={`lg:w-1/2 ${userData.submitted ? 'lg:block hidden' : ''}`}>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Nutrition Profile</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="height">Height (cm)</label>
                    <input
                      id="height"
                      name="height"
                      type="number"
                      value={userData.height}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Height in cm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="weight">Weight (kg)</label>
                    <input
                      id="weight"
                      name="weight"
                      type="number"
                      value={userData.weight}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Weight in kg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="age">Age</label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      value={userData.age}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Your age"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={userData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2" htmlFor="activityLevel">Activity Level</label>
                  <select
                    id="activityLevel"
                    name="activityLevel"
                    value={userData.activityLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="sedentary">Sedentary (little or no exercise)</option>
                    <option value="light">Light (exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                    <option value="active">Active (exercise 6-7 days/week)</option>
                    <option value="very-active">Very Active (intense exercise daily)</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2" htmlFor="goal">Your Goal</label>
                  <select
                    id="goal"
                    name="goal"
                    value={userData.goal}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="lose">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain">Gain Weight</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-3">Dietary Preferences (Optional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {dietaryOptions.map(option => (
                      <div key={option.id} className="flex items-center">
                        <input
                          id={option.id}
                          type="checkbox"
                          checked={userData.dietaryPreferences.includes(option.id)}
                          onChange={() => handleCheckboxChange(option.id)}
                          className="h-5 w-5 text-teal-500 focus:ring-teal-400 border-gray-300 rounded"
                        />
                        <label htmlFor={option.id} className="ml-2 text-gray-700">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-6 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    Create My 7-Day Meal Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Results Section */}
          <div className={`${userData.submitted ? 'lg:w-1/2 w-full' : 'hidden'}`}>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Your 7-Day Meal Plan</h2>
                <button
                  onClick={resetForm}
                  className="text-teal-500 hover:text-teal-600 font-medium"
                >
                  Create New Plan
                </button>
              </div>
              
              {loading && (
                <div className="flex flex-col items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                  <p className="mt-4 text-gray-600">Creating your personalized 7-day meal plan...</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
                  <p className="text-red-700">{error}</p>
                  <button 
                    onClick={fetchDietPlan}
                    className="mt-2 text-red-700 font-medium hover:text-red-800"
                  >
                    Try Again
                  </button>
                </div>
              )}
              
              {dietPlan && !loading && (
                <div className="meal-plan">
                  <div className="p-4 bg-teal-50 rounded-lg mb-4">
                    <p className="text-gray-700">
                      <strong>Daily Calorie Target:</strong> ~{calculateCalories()} calories
                    </p>
                    {userData.dietaryPreferences.length > 0 && (
                      <p className="text-gray-700">
                        <strong>Dietary Preferences:</strong> {userData.dietaryPreferences.map(pref => {
                          const option = dietaryOptions.find(opt => opt.id === pref);
                          return option ? option.label : pref;
                        }).join(", ")}
                      </p>
                    )}
                  </div>
                  
                  {/* Day tabs navigation */}
                  {renderDayTabs()}
                  
                  {/* Render the selected day's meal plan with enhanced styling */}
                  <div className="bg-white rounded-lg p-4" ref={pdfRef}>
                    {dietPlan && dietPlan[selectedDay] && (
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: formatMealPlanDay(dietPlan[selectedDay]) 
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Download PDF Button */}
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={generatePDF}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m-9 3h8m-8 0V7a4 4 0 018 0v3" />
                      </svg>
                      Download 7-Day Meal Plan (PDF)
                    </button>
                  </div>
                  
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Mental Health Benefits</h3>
                    <p className="text-gray-700">
                      This meal plan is designed to support your mental wellbeing through nutrient-rich foods. 
                      Foods containing omega-3 fatty acids, B vitamins, magnesium, zinc, and antioxidants 
                      have been shown to positively impact mood and brain function.
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
                  src="/images/FoodAndExcersize/Food.jpg" 
                  alt="Healthy eating illustration" 
                  className="w-full"
                />
                <div className="text-center mt-4">
                  <p className="text-gray-600 italic">
                    "Let food be thy medicine and medicine be thy food"
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

export default MealPlanner;