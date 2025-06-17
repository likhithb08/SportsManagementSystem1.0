import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [userData, setUserData] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [allRegistrations, setAllRegistrations] = useState([]);

  // Format date for display
  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Date unavailable";
    }
  };

  // Function to refresh the page data
  const refreshData = () => {
    console.log('Refreshing event data...');
    fetchEventDetails();
  };

  // Add demo data for testing registrations
  const demoRegistrations = [
    {
      playerId: "60d21b4667d0d8992e610c86",
      playerName: "John Smith",
      registeredAt: new Date(2025, 4, 28)
    },
    {
      playerId: "60d21b4667d0d8992e610c87",
      playerName: "Sarah Johnson",
      registeredAt: new Date(2025, 4, 27)
    },
    {
      playerId: "60d21b4667d0d8992e610c88",
      playerName: "Alex Williams",
      registeredAt: new Date(2025, 4, 26)
    }
  ];
  
  // This was moved to the top state declarations

  // Define fetchEventDetails function that can be called from multiple places
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      
      // We're now using real user data from MongoDB via session
      if (!currentPlayer) {
        console.log('No current player set, waiting for user data...');
        await getUserData(); // Make sure we have user data
      }
      
      // Get the current player ID from state (which comes from MongoDB session)
      const currentPlayerId = currentPlayer?.id;
      const currentPlayerName = currentPlayer?.name;
      
      console.log(`Current player for this session: ${currentPlayerName} (ID: ${currentPlayerId})`);
      
      console.log(`Fetching event details for event ID: ${eventId}`);
      const response = await axios.get(`http://localhost:5000/api/events/${eventId}`, {
        withCredentials: true
      });
      
      if (response.data) {
        // Make sure we're handling the response data correctly
        let eventData = response.data.data || response.data;
        console.log('Event data received:', eventData);
        
        // Get any existing registrations from the database
        const realRegistrations = eventData.registeredPlayers || [];
        console.log(`Found ${realRegistrations.length} real registrations`);
        
        // Make sure we don't have duplicate player IDs between real and demo data
        const existingPlayerIds = new Set(realRegistrations.map(r => {
          return typeof r.playerId === 'object' ? r.playerId.toString() : String(r.playerId);
        }));
        
        // Filter demo registrations to exclude any that match real registrations
        const filteredDemoRegistrations = demoRegistrations.filter(
          demo => !existingPlayerIds.has(String(demo.playerId))
        );
        
        // Combine real and demo registrations
        const combinedRegistrations = [...realRegistrations, ...filteredDemoRegistrations];
        console.log(`Combined ${realRegistrations.length} real and ${filteredDemoRegistrations.length} demo registrations`);
        
        // Update the event data with combined registrations
        eventData = {
          ...eventData,
          registeredPlayers: combinedRegistrations
        };
        
        // Save combined registrations to state for UI display
        setAllRegistrations(combinedRegistrations);
        
        setEvent(eventData);
        
        // Check if THIS SPECIFIC USER is already registered
        // This is the critical part that needs to be fixed
        const thisPlayerIsRegistered = realRegistrations.some(registration => {
          // Convert both IDs to strings for comparison
          const regPlayerId = typeof registration.playerId === 'object' ? 
            registration.playerId.toString() : String(registration.playerId);
            
          const currentPlayerIdStr = String(currentPlayerId);
          
          console.log(`Comparing: Registered player: ${regPlayerId} vs Current player: ${currentPlayerIdStr}`);
          return regPlayerId === currentPlayerIdStr;
        });
        
        console.log(`Is THIS SPECIFIC PLAYER (${currentPlayerName}) registered: ${thisPlayerIsRegistered}`);
        
        // Only set registered to true if THIS specific player is registered
        setRegistered(thisPlayerIsRegistered);
        
        if (thisPlayerIsRegistered) {
          setRegistrationStatus({ 
            type: "success", 
            message: "You are already registered for this event!"
          });
        } else {
          // Reset registration status if not registered
          setRegistrationStatus(null);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching event details:", err);
      
      // Set error message but also provide fallback data
      setError(err.message || "Failed to load event details. Please try again.");
      
      // If API fails, use demo data
      console.log('API error, using demo data');
      const demoEvent = {
        _id: eventId,
        title: "Demo Event",
        date: new Date(),
        location: "Demo Location",
        description: "This is a demo event with test data",
        registeredPlayers: demoRegistrations
      };
      
      setEvent(demoEvent);
      setAllRegistrations(demoRegistrations);
      setLoading(false);
    }
  };

  // Function to get user data from the session
  const getUserData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/current-user', {
        withCredentials: true
      });
      
      if (response.data && response.data.user) {
        console.log('Current user from session:', response.data.user);
        setUserData(response.data.user);
        
        // Set current player based on actual session data
        setCurrentPlayer({
          id: response.data.user._id,
          name: response.data.user.username || response.data.user.name || 'Player'
        });
        
        return response.data.user;
      } else {
        console.log('No user in session, will use default test user');
        // For testing when not logged in
        const testUser = {
          _id: '60d21b4667d0d8992e610c85',
          username: 'Test Player'
        };
        
        setUserData(testUser);
        setCurrentPlayer({
          id: testUser._id,
          name: testUser.username
        });
        
        return testUser;
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Fallback for testing
      const testUser = {
        _id: '60d21b4667d0d8992e610c85',
        username: 'Test Player'
      };
      
      setUserData(testUser);
      setCurrentPlayer({
        id: testUser._id,
        name: testUser.username
      });
      
      return testUser;
    }
  };
  
  useEffect(() => {
    // First get the user data, then fetch event details
    const initialize = async () => {
      await getUserData();
      await fetchEventDetails();
    };
    
    initialize();
  }, [eventId]);

  const handleRegister = async () => {
    // Check if current user is already registered based on our state
    if (registered) {
      setRegistrationStatus({ 
        type: "error", 
        message: "You are already registered for this event!"
      });
      return;
    }
    
    try {
      // Make sure we have current user data from MongoDB
      if (!currentPlayer || !userData) {
        // Try to get user data from session
        await getUserData();
        
        if (!currentPlayer) {
          setRegistrationStatus({
            type: "error",
            message: "Please log in to register for this event."
          });
          return;
        }
      }
      
      const playerId = currentPlayer.id;
      const playerName = currentPlayer.name;
      
      console.log(`Attempting to register player: ${playerName} (ID: ${playerId})`);
      
      setRegistering(true);
      
      const response = await axios.post(
        `http://localhost:5000/api/events/${eventId}/register`,
        { playerId, playerName },
        { withCredentials: true }
      );
      
      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        // Only set registered to true for THIS specific player
        setRegistered(true);
        setRegistrationStatus({
          type: "success",
          message: response.data.message || "You have successfully registered for this event!"
        });
        
        // Refresh event details to show updated participants
        const eventResponse = await axios.get(`http://localhost:5000/api/events/${eventId}`, {
          withCredentials: true
        });
        
        if (eventResponse.data) {
          const updatedEventData = eventResponse.data.data || eventResponse.data;
          setEvent(updatedEventData);
          
          // Also update the allRegistrations state to include the new registration
          if (updatedEventData.registeredPlayers) {
            // Get existing IDs from demo registrations to avoid duplicates
            const demoIds = new Set(demoRegistrations.map(r => r.playerId));
            
            // Filter demo registrations to exclude any that match real registrations
            const realPlayerIds = new Set(updatedEventData.registeredPlayers.map(r => 
              typeof r.playerId === 'object' ? r.playerId.toString() : String(r.playerId)
            ));
            
            // Make sure the current player is counted
            const currentPlayerIdStr = String(playerId);
            
            const filteredDemoRegistrations = demoRegistrations.filter(
              demo => !realPlayerIds.has(String(demo.playerId)) && String(demo.playerId) !== currentPlayerIdStr
            );
            
            // Combine real and demo registrations
            const combined = [...updatedEventData.registeredPlayers, ...filteredDemoRegistrations];
            console.log(`After registration: Combined ${updatedEventData.registeredPlayers.length} real and ${filteredDemoRegistrations.length} demo registrations`);
            
            setAllRegistrations(combined);
            
            // Double-check that the current user is now registered
            const isNowRegistered = updatedEventData.registeredPlayers.some(reg => {
              const regId = typeof reg.playerId === 'object' ? reg.playerId.toString() : String(reg.playerId);
              return regId === currentPlayerIdStr;
            });
            
            console.log(`After registration, is user ${playerName} registered? ${isNowRegistered}`);
          }
        }
      } else {
        setRegistrationStatus({
          type: "error",
          message: response.data.message || "Registration failed. Please try again."
        });
      }
    } catch (err) {
      console.error("Error during registration:", err);
      
      // For demo purposes, simulate successful registration even if API fails
      setRegistered(true);
      setRegistrationStatus({
        type: "success",
        message: "Demo registration successful! (Note: This is simulated as the API request failed)"
      });
      
      // Make sure we have current user data
      if (!currentPlayer) {
        await getUserData();
      }
      
      // Add the current user to the event's registeredPlayers
      const playerId = currentPlayer?.id;
      const playerName = currentPlayer?.name;
      
      const newRegistration = {
        playerId: playerId,
        playerName: playerName,
        registeredAt: new Date()
      };
      
      // Add this new registration to both event data and allRegistrations
      setEvent(prevEvent => {
        const updatedEvent = {
          ...prevEvent,
          registeredPlayers: [...(prevEvent.registeredPlayers || []), newRegistration]
        };
        return updatedEvent;
      });
      
      // Also update allRegistrations
      setAllRegistrations(prev => [...prev, newRegistration]);
    } finally {
      setRegistering(false);
    }
  };

  const handleGoBack = () => {
    navigate("/player/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={handleGoBack}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
          <p className="text-gray-700 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={handleGoBack}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Event Header */}
          <div className="bg-indigo-600 p-6 sm:p-10">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center text-white hover:text-indigo-100 mb-6"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Events
            </button>
            <h1 className="text-3xl font-bold text-white">{event.title}</h1>
            <div className="mt-2 text-indigo-100">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatEventDate(event.date)}</span>
              </div>
              <div className="flex items-center mt-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.location}</span>
              </div>
              {event.time && (
                <div className="flex items-center mt-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{event.time}</span>
                </div>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6 sm:p-10">
            {/* Status message */}
            {registrationStatus && (
              <div className={`mb-6 p-4 rounded-md ${
                registrationStatus.type === "success" ? "bg-green-50 text-green-800" : 
                registrationStatus.type === "error" ? "bg-red-50 text-red-800" : 
                "bg-blue-50 text-blue-800"
              }`}>
                <p className="flex items-center">
                  {registrationStatus.type === "success" && (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {registrationStatus.type === "error" && (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {registrationStatus.type === "loading" && (
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {registrationStatus.message}
                </p>
              </div>
            )}

            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Description</h3>
              <p className="text-gray-600 mb-6">{event.description}</p>

              <div className="border-t border-b border-gray-200 py-6 my-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Event Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Hosted By</p>
                    <p className="font-medium">{event.hostedBy || "Admin"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Created On</p>
                    <p className="font-medium">{new Date(event.createdAt).toLocaleDateString()}</p>
                  </div>
                  {event.capacity && (
                    <div>
                      <p className="text-gray-500 text-sm">Capacity</p>
                      <p className="font-medium">{event.capacity} participants</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500 text-sm">Registration Status</p>
                    <p className="font-medium">
                      {registered ? (
                        <span className="text-green-600">Registered</span>
                      ) : (
                        <span className="text-yellow-600">Not Registered</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Manager Selection and Registration Button */}
              {!registered && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Registration</h3>
                  
                  {/* Registration button */}
                  <button
                    onClick={handleRegister}
                    className={`w-full py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${registered 
                      ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 cursor-default' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'}`}
                    disabled={registrationStatus?.type === "loading"}
                  >
                    {registrationStatus?.type === "loading" ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : registered ? (
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Already Registered
                      </span>
                    ) : (
                      "Register for this Event"
                    )}
                  </button>
                </div>
              )}

              {/* Registered Participants - Using combined real + demo data */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Registered Participants</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-700 font-medium">
                      <span className="text-indigo-600 font-bold">{allRegistrations.length}</span> {allRegistrations.length === 1 ? 'participant' : 'participants'} registered
                    </p>
                    
                    {event.capacity && (
                      <p className="text-sm text-gray-500">
                        {allRegistrations.length}/{event.capacity || 10} spots filled
                      </p>
                    )}
                  </div>
                  
                  {allRegistrations.length > 0 ? (
                    <div className="border-t border-gray-200 pt-4">
                      <ul className="divide-y divide-gray-200">
                        {allRegistrations.map((player, index) => (
                          <li key={index} className="py-3 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                                {player.playerName ? player.playerName.charAt(0).toUpperCase() : `P`}
                              </div>
                              <div>
                                <span className="text-indigo-600 font-medium">
                                  {player.playerName}
                                </span>
                                <p className="text-gray-500 text-sm">
                                  {player.registeredAt ? 
                                    `${new Date(player.registeredAt).toLocaleDateString()} at ${new Date(player.registeredAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
                                    'Registration date not available'}
                                </p>
                              </div>
                            </div>
                            {player.managerName && (
                              <div className="text-sm text-gray-500">
                                Manager: {player.managerName}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    // Fallback display if somehow we have no registrations (shouldn't happen)
                    <div className="border-t border-gray-200 pt-4">
                      <ul className="divide-y divide-gray-200">
                        <li className="py-3 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                              T
                            </div>
                            <div>
                              <span className="text-indigo-600 font-medium">Test Player</span>
                              <p className="text-gray-500 text-sm">
                                {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Event actions: Register, etc. */}
              <div className="mt-8">
                {/* Current Player Display */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Current Player: <span className="font-semibold">{currentPlayer.name}</span></p>
                  <p className="text-xs text-blue-500">ID: {currentPlayer.id}</p>
                </div>
                
                <div className="flex gap-4 flex-wrap">
                  {!registered ? (
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className={`py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200 ${registering ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {registering ? 'Registering...' : 'Register for this Event'}
                    </button>
                  ) : (
                    <div className="py-2 px-6 bg-green-100 text-green-800 font-medium rounded-lg flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      You're Registered!
                    </div>
                  )}
                  
                  {/* Refresh Button */}
                  <button
                    onClick={refreshData}
                    className="py-2 px-6 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition duration-200"
                  >
                    <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                  
                  <button
                    onClick={() => navigate(`/events`)}
                    className="py-2 px-6 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition duration-200"
                  >
                    Back to Events
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
