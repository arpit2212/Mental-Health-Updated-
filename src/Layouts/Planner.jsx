import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckSquare, X, PlusCircle, Save, Zap } from 'lucide-react';

export default function AIPlanner() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', date: '', priority: 'medium' });
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [error, setError] = useState(null);

  // Gemini API integration
  const getAISuggestions = async (taskList) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("Gemini API key not found. Please check your environment variables.");
      }
      
      // Prepare user tasks data for the prompt
      const taskData = taskList.map(task => ({
        title: task.title,
        description: task.description,
        date: task.date,
        priority: task.priority,
        completed: task.completed
      }));
      
      const prompt = `
        I have the following tasks in my planner:
        ${JSON.stringify(taskData, null, 2)}
        
        Based on these tasks, please provide 3-4 mindfulness and wellness suggestions to help me manage my schedule better.
        Focus on mental health, work-life balance, stress reduction, and productivity tips.
        Keep each suggestion concise (1-2 sentences max).
        Format your response as a JSON array of strings only, with no additional text.
        Example response format: ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
      `;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      const suggestionsText = data.candidates[0].content.parts[0].text;
      
      // Parse the JSON response
      try {
        const parsedSuggestions = JSON.parse(suggestionsText.trim());
        if (Array.isArray(parsedSuggestions)) {
          setSuggestions(parsedSuggestions);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (parseError) {
        // If parsing fails, try to extract suggestions manually
        const extractedSuggestions = suggestionsText
          .split(/[\n\r]/)
          .map(line => line.trim())
          .filter(line => line.startsWith('"') || line.startsWith('-') || line.startsWith('*'))
          .map(line => line.replace(/^["*-]\s*/, '').replace(/"$/, ''))
          .filter(line => line.length > 0);
        
        if (extractedSuggestions.length > 0) {
          setSuggestions(extractedSuggestions);
        } else {
          setSuggestions(["Consider adding short breaks between tasks for mindfulness practice", 
                         "Try grouping similar tasks together to improve focus and efficiency",
                         "Remember to schedule time for self-care in your busy day"]);
        }
      }
    } catch (err) {
      console.error("Error fetching AI suggestions:", err);
      setError(err.message);
      // Provide default suggestions as fallback
      setSuggestions(["Consider adding short breaks between tasks for mindfulness practice", 
                     "Try grouping similar tasks together to improve focus and efficiency",
                     "Remember to schedule time for self-care in your busy day"]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value
    });
  };

  const addTask = () => {
    if (!newTask.title) return;
    
    const updatedTasks = [...tasks, {
      id: Date.now(),
      ...newTask,
      completed: false
    }];
    
    setTasks(updatedTasks);
    setNewTask({ title: '', description: '', date: '', priority: 'medium' });
    
    // Get new suggestions based on updated task list
    if (updatedTasks.length >= 2) {
      getAISuggestions(updatedTasks);
    }
  };

  const toggleTaskCompletion = (id) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
  };

  const refreshSuggestions = () => {
    if (tasks.length > 0) {
      getAISuggestions(tasks);
    }
  };

  // Get initial suggestions when component loads
  useEffect(() => {
    if (tasks.length >= 2) {
      getAISuggestions(tasks);
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('mindfulvista-planner-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('mindfulvista-planner-tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        if (Array.isArray(parsedTasks)) {
          setTasks(parsedTasks);
        }
      } catch (err) {
        console.error("Error loading saved tasks:", err);
      }
    }
  }, []);

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <div className="  min-h-screen p-6 bg-[#dce1e3]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Mindful Planner</h1>
          <p className="text-teal-600">Organize your day with AI-powered wellness recommendations</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Task Input */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex border-b mb-6">
              <button 
                className={`px-4 py-2 font-medium ${activeTab === 'tasks' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('tasks')}
              >
                My Tasks
              </button>
              <button 
                className={`px-4 py-2 font-medium ${activeTab === 'suggestions' ? 'text-teal-500 border-b-2 border-teal-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('suggestions')}
              >
                AI Suggestions
              </button>
            </div>

            {activeTab === 'tasks' && (
              <>
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-3 flex items-center">
                    <PlusCircle className="mr-2 text-teal-500" size={20} />
                    Add New Task
                  </h2>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="title"
                      value={newTask.title}
                      onChange={handleInputChange}
                      placeholder="Task title"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                    <textarea
                      name="description"
                      value={newTask.description}
                      onChange={handleInputChange}
                      placeholder="Description (optional)"
                      rows="2"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                    <div className="flex flex-wrap gap-3">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Date</label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-2 top-3 text-gray-400" />
                          <input
                            type="date"
                            name="date"
                            value={newTask.date}
                            onChange={handleInputChange}
                            className="w-full pl-8 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-300"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Priority</label>
                        <select
                          name="priority"
                          value={newTask.priority}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-300"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={addTask}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded transition duration-300"
                    >
                      Add to Planner
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center">
                    <CheckSquare className="mr-2 text-teal-500" size={20} />
                    Your Tasks
                  </h2>
                  
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No tasks yet. Add some tasks to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(task => (
                        <div 
                          key={task.id} 
                          className={`p-4 border rounded-lg ${task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}
                        >
                          <div className="flex justify-between">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTaskCompletion(task.id)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                              <div className={task.completed ? 'line-through text-gray-500' : ''}>
                                <h3 className="font-medium">{task.title}</h3>
                                {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                                <div className="flex items-center mt-2 text-sm text-gray-500 gap-4">
                                  {task.date && (
                                    <span className="flex items-center">
                                      <Calendar size={14} className="mr-1" /> {task.date}
                                    </span>
                                  )}
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => deleteTask(task.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'suggestions' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Zap className="mr-2 text-teal-500" size={20} />
                    AI Wellness Suggestions
                  </h2>
                  <button 
                    onClick={refreshSuggestions}
                    className="text-sm flex items-center gap-1 text-teal-600 hover:text-teal-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Thinking...' : 'Refresh'}
                  </button>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-500 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Analyzing your schedule for personalized recommendations...</p>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-red-700 font-medium">Error: {error}</p>
                    <p className="text-red-600 mt-1 text-sm">
                      Using default suggestions instead. Please check your API key configuration.
                    </p>
                    <div className="mt-4 space-y-3">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="p-4 bg-teal-50 border border-teal-100 rounded-lg">
                          <p className="text-gray-800">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : tasks.length < 2 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Add at least two tasks to get personalized recommendations.</p>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="p-4 bg-teal-50 border border-teal-100 rounded-lg">
                        <p className="text-gray-800">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Click "Refresh" to get personalized recommendations based on your tasks.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Calendar View */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 text-teal-500" size={20} />
              Calendar View
            </h2>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-teal-500 text-white p-2 text-center">
                April 2025
              </div>
              <div className="grid grid-cols-7 text-center text-sm">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="py-2 border-b font-medium">{day}</div>
                ))}
                
                {/* Empty cells for previous month */}
                {[...Array(3)].map((_, i) => (
                  <div key={`empty-start-${i}`} className="p-2 text-gray-400 border border-gray-100">
                    {28 + i}
                  </div>
                ))}
                
                {/* Days of current month */}
                {[...Array(30)].map((_, i) => {
                  const day = i + 1;
                  const formattedDate = `2025-04-${day < 10 ? '0' + day : day}`;
                  const hasTask = tasks.some(task => task.date === formattedDate);
                  
                  return (
                    <div 
                      key={`day-${day}`}
                      className={`p-2 border border-gray-100 ${
                        hasTask ? 'bg-teal-50 font-medium' : ''
                      } ${day === 14 ? 'bg-teal-100 border-teal-300' : ''}`}
                    >
                      {day}
                      {hasTask && <div className="h-1 w-1 bg-teal-500 rounded-full mx-auto mt-1"></div>}
                    </div>
                  );
                })}
                
                {/* Empty cells for next month */}
                {[...Array(4)].map((_, i) => (
                  <div key={`empty-end-${i}`} className="p-2 text-gray-400 border border-gray-100">
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-2">Upcoming</h3>
              <div className="space-y-3">
                {tasks
                  .filter(task => !task.completed)
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 3)
                  .map(task => (
                    <div key={`upcoming-${task.id}`} className="flex items-center gap-2 p-2 rounded bg-gray-50">
                      <div className={`w-2 h-2 rounded-full ${
                        priorityColors[task.priority].split(' ')[0].replace('bg-', 'bg-')
                      }`}></div>
                      <div className="text-sm truncate">{task.title}</div>
                      {task.date && (
                        <div className="text-xs text-gray-500 ml-auto">{task.date}</div>
                      )}
                    </div>
                  ))}
                
                {tasks.filter(task => !task.completed).length === 0 && (
                  <p className="text-sm text-gray-500 italic">No upcoming tasks</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Wellness Tip</h3>
                <p className="text-sm text-blue-700">
                  Remember to schedule short breaks between tasks. Even a 5-minute mindfulness 
                  practice can help reduce stress and improve focus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}