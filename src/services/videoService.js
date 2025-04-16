// src/services/videoService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Get video recommendations based on mood using Google Gemini AI
 * @param {string} mood - The user's current mood
 * @returns {Promise<Array>} - Array of video recommendations
 */
export async function getVideoRecommendations(mood) {
  try {
    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Construct the prompt for Gemini - now including url in the structure
    const prompt = `As a mental health content creator, recommend exactly 5 videos for someone feeling ${mood}. 
    Return ONLY a JSON array with this structure and nothing else: 
    [{"title": "Video Title", "creator": "Creator Name", "description": "Brief explanation of why this video helps with this mood", "url": "Direct URL to the video (preferably YouTube)"}]`;

    // Generate content from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    // Gemini might return text with the JSON embedded, so we need to parse it carefully
    const jsonMatch = text.match(/\[.*?\]/s);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      return JSON.parse(jsonStr);
    }
    
    throw new Error("Could not parse JSON from Gemini response");
  } catch (error) {
    console.error("Error getting video recommendations from Gemini:", error);
    // Return empty array in case of error
    return [];
  }
}