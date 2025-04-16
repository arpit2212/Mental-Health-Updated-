import { supabase } from '../services/supabaseClient';

// Get user by clerk ID
export async function getUserByClerkId(clerkId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return data;
}

// Create user profile in Supabase
export async function createUserProfile(userData) {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select();
  
  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
  
  return data[0];
}

// Update user profile in Supabase
export async function updateUserProfile(clerkId, updates) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('clerk_id', clerkId)
    .select();
  
  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
  
  return data[0];
}