// services/diaryService.js
import { supabase } from './supabaseClient';

export const diaryService = {
  // Get all diary entries for the current user
  async getUserDiaryEntries(userId) {
    try {
      console.log('Fetching entries for user:', userId);
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false });
        
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching diary entries:', error);
      throw error;
    }
  },
  
  // Get entries for a specific date
  async getEntriesByDate(userId, date) {
    try {
      // Format date to YYYY-MM-DD for DB query
      const formattedDate = new Date(date).toISOString().split('T')[0];
      console.log(`Fetching entries for user ${userId} on date ${formattedDate}`);
      
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_date', formattedDate)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching entries by date:', error);
      throw error;
    }
  },
  
  // Save a new diary entry
  async saveDiaryEntry(userId, entry) {
    try {
      // Format the date to YYYY-MM-DD for DB storage
      const formattedDate = new Date(entry.date).toISOString().split('T')[0];
      console.log(`Saving entry for user ${userId} on date ${formattedDate}`);
      
      // Log the full payload for debugging
      const payload = {
        user_id: userId,
        entry_date: formattedDate,
        entry_text: entry.text,
        mood: entry.mood,
        timestamp: entry.timestamp
      };
      console.log('Entry payload:', payload);
      
      const { data, error } = await supabase
        .from('diary_entries')
        .insert(payload)
        .select();
        
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('Entry saved successfully:', data);
      return data[0];
    } catch (error) {
      console.error('Error saving diary entry:', error);
      throw error;
    }
  },
  
  // Delete a diary entry
  async deleteDiaryEntry(entryId) {
    try {
      console.log(`Deleting entry with ID: ${entryId}`);
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', entryId);
        
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error deleting diary entry:', error);
      throw error;
    }
  },
  
  // Update a diary entry
  async updateDiaryEntry(entryId, updatedEntry) {
    try {
      console.log(`Updating entry with ID: ${entryId}`);
      console.log('Updated entry data:', updatedEntry);
      
      const { data, error } = await supabase
        .from('diary_entries')
        .update({
          entry_text: updatedEntry.text,
          mood: updatedEntry.mood,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId)
        .select();
        
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('Entry updated successfully:', data);
      return data[0];
    } catch (error) {
      console.error('Error updating diary entry:', error);
      throw error;
    }
  }
};