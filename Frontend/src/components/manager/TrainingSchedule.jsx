import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TrainingSchedule = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    teamId: '',
    type: 'Regular'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teams
        const teamsResponse = await axios.get('http://localhost:5000/api/manager/teams', {
          withCredentials: true
        });
        setTeams(teamsResponse.data);
        
        // Fetch training sessions
        const trainingsResponse = await axios.get('http://localhost:5000/api/manager/trainings', {
          withCredentials: true
        });
        setTrainingSessions(trainingsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Combine date and time for API
      const formattedData = {
        ...formData,
        startDateTime: `${formData.date}T${formData.startTime}:00`,
        endDateTime: `${formData.date}T${formData.endTime}:00`,
      };
      
      // Remove separate date and time fields
      delete formattedData.date;
      delete formattedData.startTime;
      delete formattedData.endTime;
      
      const response = await axios.post(
        'http://localhost:5000/api/manager/trainings',
        formattedData,
        { withCredentials: true }
      );
      
      // Add new training to list
      setTrainingSessions([...trainingSessions, response.data]);
      
      // Reset form
      setFormData({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        teamId: '',
        type: 'Regular'
      });
      
      setShowForm(false);
    } catch (err) {
      console.error('Error creating training:', err);
      setError(err.response?.data?.message || 'Failed to create training session');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (trainingId) => {
    if (!window.confirm('Are you sure you want to delete this training session?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/manager/trainings/${trainingId}`, {
        withCredentials: true
      });
      
      // Remove deleted training from list
      setTrainingSessions(trainingSessions.filter(t => t._id !== trainingId));
    } catch (err) {
      console.error('Error deleting training:', err);
      setError('Failed to delete training session');
    }
  };
  
  // Helper function to format date and time
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  if (loading && trainingSessions.length === 0) return <div className="p-8">Loading...</div>;
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Training Schedule</h1>
            <p className="text-gray-500">Manage team training sessions</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/manager/dashboard')}
              className="px-4 py-2 text-indigo-500 hover:text-indigo-600 bg-white rounded-lg shadow"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600"
            >
              {showForm ? 'Cancel' : 'Schedule Training'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Training Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Schedule New Training</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Team Fitness Training"
                  />
                </div>
                
                {/* Team */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team
                  </label>
                  <select
                    name="teamId"
                    value={formData.teamId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a team</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Training Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Technical">Technical</option>
                    <option value="Tactical">Tactical</option>
                    <option value="Recovery">Recovery</option>
                  </select>
                </div>
                
                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Main Field"
                  />
                </div>
                
                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add details about the training session"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mr-4"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                  disabled={loading}
                >
                  {loading ? 'Scheduling...' : 'Schedule Training'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Training Sessions List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <h2 className="text-xl font-bold text-gray-800 p-6 border-b">Upcoming Training Sessions</h2>
          
          {trainingSessions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No training sessions scheduled yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 text-indigo-500 hover:text-indigo-600"
              >
                Schedule your first training session
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 text-gray-600">Title</th>
                    <th className="text-left py-3 px-4 text-gray-600">Team</th>
                    <th className="text-left py-3 px-4 text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 text-gray-600">Date & Time</th>
                    <th className="text-left py-3 px-4 text-gray-600">Location</th>
                    <th className="text-left py-3 px-4 text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trainingSessions.map((session) => {
                    const team = teams.find(t => t._id === session.teamId) || { name: 'Unknown Team' };
                    
                    return (
                      <tr key={session._id} className="border-t">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-800">{session.title}</div>
                          {session.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {session.description}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">{team.name}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            session.type === 'Regular' ? 'bg-blue-100 text-blue-600' :
                            session.type === 'Fitness' ? 'bg-green-100 text-green-600' :
                            session.type === 'Technical' ? 'bg-purple-100 text-purple-600' :
                            session.type === 'Tactical' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {session.type}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div>{formatDateTime(session.startDateTime)}</div>
                          <div className="text-sm text-gray-500">
                            to {new Date(session.endDateTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-4">{session.location}</td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleDelete(session._id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingSchedule; 