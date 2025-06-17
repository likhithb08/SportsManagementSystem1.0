import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const PlayerProfile = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  useEffect(() => {
    const fetchPlayerProfile = async () => {
      try {
        // Fetch player data
        const response = await axios.get(`http://localhost:5000/api/player/${playerId}`, {
          withCredentials: true
        });
        
        if (response.data) {
          setPlayerData(response.data);
        }
        
        // Fetch events the player has registered for
        const eventsResponse = await axios.get(`http://localhost:5000/api/events/player/${playerId}/registered`, {
          withCredentials: true
        });
        
        if (eventsResponse.data && eventsResponse.data.data) {
          setRegisteredEvents(eventsResponse.data.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching player profile:", err);
        setError("Failed to load player profile. The player may not exist or you may not have permission to view this profile.");
        setLoading(false);
      }
    };

    fetchPlayerProfile();
  }, [playerId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  // Fallback display when the API call fails or the endpoint isn't implemented yet
  const renderFallbackProfile = () => {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <div className="flex items-center">
            <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center text-indigo-600 text-2xl font-bold">
              {playerData?.username ? playerData.username.charAt(0).toUpperCase() : "P"}
            </div>
            <div className="ml-4">
              <h2 className="text-white text-2xl font-bold">
                {playerData?.username || "Player Profile"}
              </h2>
              <p className="text-indigo-200">
                {playerData?.role || "Player"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Player Information</h3>
            <div className="bg-gray-50 rounded p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{playerData?.username || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{playerData?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{playerData?.role || "Player"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Registered Events - Mock Data if API not implemented */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Registered Events</h3>
            {registeredEvents && registeredEvents.length > 0 ? (
              <div className="space-y-3">
                {registeredEvents.map((event, index) => (
                  <div key={index} className="bg-gray-50 rounded p-4 hover:bg-gray-100 transition duration-150">
                    <Link to={`/player/events/${event._id}`} className="block">
                      <h4 className="font-medium text-indigo-600">{event.title}</h4>
                      <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded p-4 text-center">
                <p className="text-gray-500">No registered events found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading player profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden p-6">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Profile Not Available</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <div className="mt-6">
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render with player data
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={handleGoBack}
          className="mb-6 inline-flex items-center text-indigo-600 hover:text-indigo-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        {/* Render the fallback profile in this demo version */}
        {renderFallbackProfile()}
      </div>
    </div>
  );
};

export default PlayerProfile;
