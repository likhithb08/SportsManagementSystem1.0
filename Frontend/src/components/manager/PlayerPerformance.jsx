import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PlayerPerformance = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [performanceData, setPerformanceData] = useState({
    fitness: 0,
    technique: 0,
    teamwork: 0,
    consistency: 0,
    discipline: 0,
    notes: ''
  });

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        console.log("Fetching player data for ID:", playerId);
        const response = await axios.get(`http://localhost:5000/api/manager/players/${playerId}`, {
          withCredentials: true
        });
        console.log("Player data response:", response.data);
        setPlayer(response.data);
        
        // Fetch performance data separately for more reliable loading
        await fetchPerformanceData();
      } catch (err) {
        console.error('Error fetching player data:', err);
        if (err.response) {
          setError(`Failed to load player data: ${err.response.data.message || err.response.statusText}`);
        } else if (err.request) {
          setError('Failed to load player data: No response from server');
        } else {
          setError(`Failed to load player data: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId]);

  const fetchPerformanceData = async () => {
    try {
      const perfResponse = await axios.get(`http://localhost:5000/api/manager/players/${playerId}/performance`, {
        withCredentials: true
      });
      
      console.log("Performance data response:", perfResponse.data);
      
      // Update state with performance data
      setPerformanceData({
        fitness: perfResponse.data.fitness || 0,
        technique: perfResponse.data.technique || 0,
        teamwork: perfResponse.data.teamwork || 0,
        consistency: perfResponse.data.consistency || 0,
        discipline: perfResponse.data.discipline || 0,
        notes: perfResponse.data.notes || ''
      });
    } catch (err) {
      console.error('Error fetching performance data:', err);
      // Don't show error, just initialize with defaults
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerformanceData({
      ...performanceData,
      [name]: name === 'notes' ? value : parseInt(value, 10)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log("Submitting performance data:", performanceData);
      console.log("For player ID:", playerId);
      
      const response = await axios.post(
        `http://localhost:5000/api/manager/players/${playerId}/performance`,
        performanceData,
        { withCredentials: true }
      );
      
      console.log("Performance update response:", response.data);
      setSuccessMessage('Performance data saved successfully');
      
      // Show success message for 2 seconds then navigate back
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      console.error('Error saving performance data:', err);
      setError(err.response?.data?.message || 'Failed to save performance data');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !player) return <div className="p-8">Loading player data...</div>;
  if (error && !player) return <div className="p-8 text-red-500">{error}</div>;
  if (!player) return <div className="p-8">Player not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{player.username}'s Performance</h1>
            <p className="text-gray-500">Edit and track player performance metrics</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-indigo-500 hover:text-indigo-600 bg-white rounded-lg shadow"
          >
            Back
          </button>
        </div>

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Fitness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fitness Level (0-100)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    name="fitness"
                    min="0"
                    max="100"
                    value={performanceData.fitness}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 w-12 text-center">{performanceData.fitness}</span>
                </div>
              </div>

              {/* Technique */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technique (0-100)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    name="technique"
                    min="0"
                    max="100"
                    value={performanceData.technique}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 w-12 text-center">{performanceData.technique}</span>
                </div>
              </div>

              {/* Teamwork */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teamwork (0-100)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    name="teamwork"
                    min="0"
                    max="100"
                    value={performanceData.teamwork}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 w-12 text-center">{performanceData.teamwork}</span>
                </div>
              </div>

              {/* Consistency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consistency (0-100)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    name="consistency"
                    min="0"
                    max="100"
                    value={performanceData.consistency}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 w-12 text-center">{performanceData.consistency}</span>
                </div>
              </div>

              {/* Discipline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discipline (0-100)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    name="discipline"
                    min="0"
                    max="100"
                    value={performanceData.discipline}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 w-12 text-center">{performanceData.discipline}</span>
                </div>
              </div>

              {/* Overall Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Performance
                </label>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 h-2 rounded-full">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (performanceData.fitness +
                            performanceData.technique +
                            performanceData.teamwork +
                            performanceData.consistency +
                            performanceData.discipline) /
                          5
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="ml-3 w-12 text-center">
                    {Math.round(
                      (performanceData.fitness +
                        performanceData.technique +
                        performanceData.teamwork +
                        performanceData.consistency +
                        performanceData.discipline) /
                        5
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Performance Notes
              </label>
              <textarea
                name="notes"
                rows="4"
                value={performanceData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add notes about player's performance, areas for improvement, etc."
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mr-4"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Performance Data'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlayerPerformance; 