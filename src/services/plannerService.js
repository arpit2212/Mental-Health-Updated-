// services/plannerService.js
import { supabase } from './supabaseClient';

export const plannerService = {
  // Get all planner tasks for the current user
  async getUserTasks(userId) {
    try {
      console.log('Fetching tasks for user:', userId);
      const { data, error } = await supabase
        .from('planner_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('task_date', { ascending: true });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching planner tasks:', error);
      throw error;
    }
  },

  // Get tasks for a specific date
  async getTasksByDate(userId, date) {
    try {
      // Format date to YYYY-MM-DD for DB query
      const formattedDate = new Date(date).toISOString().split('T')[0];
      console.log(`Fetching tasks for user ${userId} on date ${formattedDate}`);

      const { data, error } = await supabase
        .from('planner_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('task_date', formattedDate)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching tasks by date:', error);
      throw error;
    }
  },

  // Save a new task
  async saveTask(userId, task) {
    try {
      // Format the date to YYYY-MM-DD for DB storage if it exists
      const formattedDate = task.date ? new Date(task.date).toISOString().split('T')[0] : null;
      console.log(`Saving task for user ${userId}`);

      // Log the full payload for debugging
      const payload = {
        user_id: userId,
        title: task.title,
        description: task.description || '',
        task_date: formattedDate,
        priority: task.priority || 'medium',
        completed: task.completed || false
      };
      console.log('Task payload:', payload);

      const { data, error } = await supabase
        .from('planner_tasks')
        .insert(payload)
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Task saved successfully:', data);
      return data[0];
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  },

  // Update a task's completion status
  async toggleTaskCompletion(taskId, completionStatus) {
    try {
      console.log(`Toggling completion for task with ID: ${taskId} to ${completionStatus}`);
      
      const { data, error } = await supabase
        .from('planner_tasks')
        .update({
          completed: completionStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Task completion updated successfully:', data);
      return data[0];
    } catch (error) {
      console.error('Error updating task completion:', error);
      throw error;
    }
  },

  // Delete a task
  async deleteTask(taskId) {
    try {
      console.log(`Deleting task with ID: ${taskId}`);
      const { error } = await supabase
        .from('planner_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Update a task
  async updateTask(taskId, updatedTask) {
    try {
      console.log(`Updating task with ID: ${taskId}`);
      
      // Format the date if it exists
      const formattedDate = updatedTask.date ? new Date(updatedTask.date).toISOString().split('T')[0] : null;
      
      const updatePayload = {
        title: updatedTask.title,
        description: updatedTask.description || '',
        task_date: formattedDate,
        priority: updatedTask.priority || 'medium',
        updated_at: new Date().toISOString()
      };
      
      console.log('Updated task data:', updatePayload);

      const { data, error } = await supabase
        .from('planner_tasks')
        .update(updatePayload)
        .eq('id', taskId)
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Task updated successfully:', data);
      return data[0];
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }
};