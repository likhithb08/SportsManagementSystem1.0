import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeamDetails = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const teamResponse = await axios.get(`http://localhost:5000/api/manager/teams/${teamId}`, {
          withCredentials: true
        });
        setTeam(teamResponse.data);
        setTeamPlayers(teamResponse.data.players || []);
        
        // Fetch all available players
        const playersResponse = await axios.get('http://localhost:5000/api/manager/available-players', {
          withCredentials: true
        });
        setAvailablePlayers(playersResponse.data);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  const handleAddPlayer = async () => {
    if (!selectedPlayerId) return;

    try {
      await axios.post(`http://localhost:5000/api/manager/teams/${teamId}/add-player`, 
      { playerId: selectedPlayerId }, 
      { withCredentials: true });
      
      // Refresh team data
      const response = await axios.get(`http://localhost:5000/api/manager/teams/${teamId}`, {
        withCredentials: true
      });
      setTeam(response.data);
      setTeamPlayers(response.data.players || []);
      setSelectedPlayerId('');
    } catch (err) {
      console.error('Error adding player:', err);
      setError(err.response?.data?.message || 'Failed to add player');
    }
  };

  const handleRemovePlayer = async (playerId) => {
    try {
      await axios.post(`http://localhost:5000/api/manager/teams/${teamId}/remove-player`, 
      { playerId }, 
      { withCredentials: true });
      
      // Refresh team data
      const response = await axios.get(`http://localhost:5000/api/manager/teams/${teamId}`, {
        withCredentials: true
      });
      setTeam(response.data);
      setTeamPlayers(response.data.players || []);
    } catch (err) {
      console.error('Error removing player:', err);
      setError(err.response?.data?.message || 'Failed to remove player');
    }
  };

  const handleViewPerformance = (playerId) => {
    navigate(`/manager/player/${playerId}/performance`);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!team) return <div className="p-8">Team not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{team.name}</h1>
            <p className="text-gray-500">Team Management</p>
          </div>
          <button
            onClick={() => navigate('/manager/dashboard')}
            className="px-4 py-2 text-indigo-500 hover:text-indigo-600 bg-white rounded-lg shadow"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Team Players Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Team Players</h2>
          
          {teamPlayers.length === 0 ? (
            <p className="text-gray-500">No players in this team yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-gray-600">Position</th>
                    <th className="text-left py-3 px-4 text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPlayers.map((player) => (
                    <tr key={player._id} className="border-b last:border-b-0">
                      <td className="py-3 px-4">{player.username}</td>
                      <td className="py-3 px-4">{player.position || 'Not specified'}</td>
                      <td className="py-3 px-4">{player.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-600">
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleRemovePlayer(player._id)}
                          className="text-red-500 hover:text-red-600 mr-3"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => handleViewPerformance(player._id)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Performance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Player Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Add Player to Team</h2>
          
          {availablePlayers.length === 0 ? (
            <p className="text-gray-500">No available players to add.</p>
          ) : (
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label htmlFor="player" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Player
                </label>
                <select
                  id="player"
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a player</option>
                  {availablePlayers.map((player) => (
                    <option key={player._id} value={player._id}>
                      {player.username} ({player.email})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddPlayer}
                disabled={!selectedPlayerId}
                className={`px-4 py-2 rounded-lg ${
                  !selectedPlayerId
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
              >
                Add to Team
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetails; 