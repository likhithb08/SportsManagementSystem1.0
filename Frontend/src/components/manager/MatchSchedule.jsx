import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MatchSchedule = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    opponent: '',
    description: '',
    teamId: '',
    matchType: 'Friendly'
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsResponse = await axios.get('http://localhost:5000/api/manager/teams', {
          withCredentials: true
        });
        setTeams(teamsResponse.data);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // This is just a placeholder - we'll implement match creation in the future
    alert('Match scheduling will be implemented in a future update. Match details recorded:\n' + 
      JSON.stringify(formData, null, 2));
    setShowForm(false);
  };
  
  if (loading) return <div className="p-8">Loading...</div>;
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Match Schedule</h1>
            <p className="text-gray-500">Manage upcoming matches for your teams</p>
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
              {showForm ? 'Cancel' : 'Schedule Match'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Match Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Schedule New Match</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Match Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Home vs Visitors"
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
                
                {/* Opponent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opponent
                  </label>
                  <input
                    type="text"
                    name="opponent"
                    value={formData.opponent}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Opponent Team Name"
                  />
                </div>
                
                {/* Match Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Match Type
                  </label>
                  <select
                    name="matchType"
                    value={formData.matchType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Friendly">Friendly</option>
                    <option value="League">League</option>
                    <option value="Cup">Cup</option>
                    <option value="Tournament">Tournament</option>
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
                
                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
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
                    placeholder="Stadium or Venue Name"
                  />
                </div>
                
                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Additional details about the match"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mr-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  Schedule Match
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Coming Soon Message */}
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Match Scheduling Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            Full match scheduling functionality will be available in the next update. 
            You'll be able to schedule matches, track scores, and manage match details.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/manager/dashboard')}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchSchedule; 