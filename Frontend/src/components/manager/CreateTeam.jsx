import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateTeam = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!teamName.trim()) {
        setError('Team name is required');
        setLoading(false);
        return;
      }

      await axios.post(
        'http://localhost:5000/api/manager/teams',
        { name: teamName },
        { withCredentials: true }
      );

      navigate('/manager/dashboard');
    } catch (err) {
      console.error('Error creating team:', err);
      setError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Team</h2>
          <p className="text-gray-500">Add a new team to your management roster</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="teamName" className="block text-gray-700 font-medium mb-2">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter team name"
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/manager/dashboard')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam; 