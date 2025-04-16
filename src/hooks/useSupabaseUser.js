// hooks/useSupabaseUser.js
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../services/supabaseClient';

export function useSupabaseUser() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only proceed if Clerk has loaded and the user is signed in
    if (!isLoaded || !isSignedIn || !user) {
      setIsLoading(false);
      return;
    }

    const syncUserWithSupabase = async () => {
      setIsLoading(true);
      try {
        console.log('Syncing Clerk user to Supabase:', user.id);
        
        // Check if user already exists in Supabase
        const { data: existingUsers, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', user.id);
          
        if (fetchError) {
          console.error('Error fetching user from Supabase:', fetchError);
          setError(fetchError);
          return;
        }
        
        let dbUser = null;
        
        if (existingUsers && existingUsers.length > 0) {
          // User exists, update if needed
          dbUser = existingUsers[0];
          console.log('User exists in Supabase:', dbUser);
          
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
              username: user.username || user.firstName || 'User',
              email: user.primaryEmailAddress?.emailAddress,
              last_sign_in: new Date().toISOString()
            })
            .eq('clerk_id', user.id)
            .select();
            
          if (updateError) {
            console.error('Error updating user in Supabase:', updateError);
            setError(updateError);
          } else if (updatedUser && updatedUser.length > 0) {
            dbUser = updatedUser[0];
          }
        } else {
          // User doesn't exist, create new record
          console.log('Creating new user in Supabase');
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              clerk_id: user.id,
              username: user.username || user.firstName || 'User',
              email: user.primaryEmailAddress?.emailAddress,
              created_at: new Date().toISOString(),
              last_sign_in: new Date().toISOString()
            })
            .select();
            
          if (insertError) {
            console.error('Error creating user in Supabase:', insertError);
            setError(insertError);
          } else if (newUser && newUser.length > 0) {
            dbUser = newUser[0];
          }
        }
        
        setSupabaseUser(dbUser);
      } catch (error) {
        console.error('Unexpected error syncing user with Supabase:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    syncUserWithSupabase();
  }, [user, isLoaded, isSignedIn]);

  return { 
    user: supabaseUser, 
    clerkUser: user, 
    isLoaded: isLoaded && !isLoading, 
    isSignedIn, 
    error 
  };
}