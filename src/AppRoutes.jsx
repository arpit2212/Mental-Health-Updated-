import { Routes, Route } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useSupabaseUser } from './hooks/useSupabaseUser'; // Import the hook
import App from './App';
import ChatbotPage from './Page/ChatbotPage';
import MeditationPage from './Page/MeditationPage';
import BooksPage from './Page/BooksPage';
import SongsPage from './Page/SongsPage';
import VideoPage from './Page/VideoPage';
import PLannerPage from './Page/PlannerPage';
import DearDiaryPage from './Page/DearDiaryPage';
import GamePage from './Page/GamePage';
import FoodPage from './Page/FoodPage';
import ExercisePage from './Page/ExercisePage';

// Protected route component that opens sign-in modal when not authenticated
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { openSignIn } = useClerk();
  const { user } = useSupabaseUser(); // Use the hook to sync with Supabase
  
  useEffect(() => {
    // When the component mounts, check if the user is signed in
    // If not, open the sign-in modal
    if (isLoaded && !isSignedIn) {
      openSignIn();
    }
  }, [isLoaded, isSignedIn, openSignIn]);
  
  // Show loading indicator while Clerk is initializing
  if (!isLoaded) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Only render the children if the user is signed in
  // Otherwise, render a message asking them to sign in
  return isSignedIn ? children : (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-6 max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
        <p className="text-gray-600 mb-6">Please sign in to access this page.</p>
        <button 
          onClick={() => openSignIn()}
          className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default function AppRoutes() {
  // Use the hook to sync users with Supabase at the app level too
  useSupabaseUser();
  
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<App />} />
      
      {/* Protected routes */}
      <Route path="/chatbot" element={
        <ProtectedRoute>
          <ChatbotPage />
        </ProtectedRoute>
      } />
      <Route path="/Meditation" element={
        <ProtectedRoute>
          <MeditationPage />
        </ProtectedRoute>
      } />
      <Route path="/Books" element={
        <ProtectedRoute>
          <BooksPage />
        </ProtectedRoute>
      } />
      <Route path="/Songs" element={
        <ProtectedRoute>
          <SongsPage />
        </ProtectedRoute>
      } />
      <Route path="/Videos" element={
        <ProtectedRoute>
          <VideoPage />
        </ProtectedRoute>
      } />
      <Route path="/Planner" element={
        <ProtectedRoute>
          <PLannerPage />
        </ProtectedRoute>
      } />
      <Route path="/diary" element={
        <ProtectedRoute>
          <DearDiaryPage />
        </ProtectedRoute>
      } />
      <Route path="/fun" element={
        <ProtectedRoute>
          <GamePage />
        </ProtectedRoute>
      } />
      <Route path="/food" element={
        <ProtectedRoute>
          <FoodPage />
        </ProtectedRoute>
      } />
      <Route path="/Exercise" element={
        <ProtectedRoute>
          <ExercisePage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}