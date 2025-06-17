import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { IoMdNotificationsOutline } from 'react-icons/io';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState("");
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [performanceData, setPerformanceData] = useState({
    fitness: 75,
    technique: 70,
    teamwork: 80,
    consistency: 65,
    discipline: 75,
    notes: ''
  });
  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [teamInfo, setTeamInfo] = useState(null);
  const [managerInfo, setManagerInfo] = useState(null);
  const [events, setEvents] = useState([]);

  const markAsRead = async (notifId) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${notifId}/read`, {}, {
        withCredentials: true,
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  // Add new function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/notifications/mark-all-read", 
        {}, 
        { withCredentials: true }
      );
      
      console.log("Marked all notifications as read:", response.data);
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, chatRes, trainingRes, eventsRes] = await Promise.all([
          fetch('http://localhost:5000/api/player/me', { credentials: 'include' }),
          fetch('http://localhost:5000/api/chat'),
          fetch('http://localhost:5000/api/player/training', { credentials: 'include' }),
          fetch('http://localhost:5000/api/events', { credentials: 'include' }),
        ]);

        const [user, chatMessages, trainings, eventsData] = await Promise.all([
          userRes.json(),
          chatRes.json(),
          trainingRes.json(),
          eventsRes.json(),
        ]);

        setUserData(user);
        setMessages(chatMessages);
        
        console.log("Initial training data:", trainings);
        if (Array.isArray(trainings)) {
          setTrainingSessions(trainings);
          console.log(`Set ${trainings.length} initial training sessions`);
        }
        
        console.log("Events data:", eventsData);
        if (eventsData && eventsData.success) {
          setEvents(eventsData.data || []);
          console.log(`Set ${eventsData.data.length} events`);
        } else if (Array.isArray(eventsData)) {
          setEvents(eventsData);
          console.log(`Set ${eventsData.length} events`);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Add new effect for fetching notifications and polling for new ones
  useEffect(() => {
    // Function to fetch notifications
    const fetchNotifications = async () => {
      try {
        console.log("Fetching notifications...");
        const response = await axios.get(
          "http://localhost:5000/api/notifications",
          { withCredentials: true }
        );
        
        if (Array.isArray(response.data)) {
          console.log(`Fetched ${response.data.length} notifications`);
          
          // Check if there are new unread notifications
          const newUnreadCount = response.data.filter(n => !n.read).length;
          const currentUnreadCount = notifications.filter(n => !n.read).length;
          
          // If we have new unread notifications, show visual indicator/play sound
          if (newUnreadCount > currentUnreadCount && notifications.length > 0) {
            // Show visual notification indicator (pulse animation will be added via class)
            console.log("New notifications received!");
          }
          
          setNotifications(response.data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Set up polling every 15 seconds to check for new notifications
    const notificationInterval = setInterval(fetchNotifications, 15000);

    // Clean up interval on component unmount
    return () => clearInterval(notificationInterval);
  }, []); // Empty dependency array to only run on mount

  const performanceStats = [
    { title: "Matches Played", value: "12", change: "+2 this month" },
    { title: "Goals Scored", value: "8", change: "+1 last match" },
    { title: "Assists", value: "5", change: "+2 this season" },
    { title: "Fitness Level", value: "95%", change: "+3%" },
  ];

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        console.log("Fetching player data...");
        const response = await axios.get(
          "http://localhost:5000/api/player/me",
          {
            withCredentials: true, // Send cookies for session authentication
          }
        );
        console.log("Player data response:", response.data);
        
        if (response.data && response.data.email) {
          setUserData(response.data);
          console.log("User data set successfully with email:", response.data.email);
        } else {
          console.warn("Player data response is missing expected fields");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching player data:", error);
        // Don't keep app in loading state even if there's an error
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, []);

  // New effect for fetching team and manager data
  useEffect(() => {
    const fetchTeamAndManagerData = async () => {
      if (!userData || !userData._id) return;
      
      try {
        // Get team info for the player
        const teamResponse = await axios.get(
          `http://localhost:5000/api/player/team-info`,
          { withCredentials: true }
        );
        
        if (teamResponse.data) {
          setTeamInfo(teamResponse.data.team);
          setManagerInfo(teamResponse.data.manager);
        }
      } catch (error) {
        console.error("Error fetching team and manager info:", error);
      }
    };
    
    fetchTeamAndManagerData();
  }, [userData]);

  // New effect for fetching performance history
  useEffect(() => {
    const fetchPerformanceHistory = async () => {
      try {
        console.log("Fetching performance history...");
        console.log("User data available:", userData ? "Yes" : "No");
        
        const response = await axios.get(
          `http://localhost:5000/api/player/performance-history`,
          { withCredentials: true }
        );
        
        console.log("Performance history response:", response.data);
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          setPerformanceHistory(response.data);
        } else {
          console.warn("Performance history is empty or not in expected format");
        }
      } catch (error) {
        console.error("Error fetching performance history:", error);
      }
    };
    
    if (activeTab === "performance") {
      fetchPerformanceHistory();
    }
  }, [activeTab, userData]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/player/schedule",
          {
            withCredentials: true,
          }
        );
        setSchedule(response.data);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
    };

    const fetchTraining = async () => {
      try {
        console.log("Fetching training sessions...");
        const response = await axios.get(
          "http://localhost:5000/api/player/training",
          {
            withCredentials: true,
          }
        );
        console.log("Training sessions response:", response.data);
        
        if (Array.isArray(response.data)) {
          setTrainingSessions(response.data);
          console.log(`Loaded ${response.data.length} training sessions`);
        } else {
          console.error("Training data is not an array:", response.data);
          setTrainingSessions([]);
        }
      } catch (error) {
        console.error("Error fetching training sessions:", error);
        setTrainingSessions([]);
      }
    };

    if (activeTab === "schedule") fetchSchedule();
    if (activeTab === "training") fetchTraining();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "performance") {
      // Immediately fetch performance data when tab changes to performance
      const fetchBothPerformanceData = async () => {
        try {
          console.log("Fetching all performance data for tab change...");
          
          // Fetch current performance
          const perfResponse = await axios.get(
            "http://localhost:5000/api/player/performance",
            { withCredentials: true }
          );
          
          console.log("Performance data response:", perfResponse.data);
          if (perfResponse.data && typeof perfResponse.data === 'object') {
            setPerformanceData(perfResponse.data);
          }
          
          // Fetch performance history
          const historyResponse = await axios.get(
            "http://localhost:5000/api/player/performance-history",
            { withCredentials: true }
          );
          
          console.log("Performance history response:", historyResponse.data);
          if (Array.isArray(historyResponse.data)) {
            setPerformanceHistory(historyResponse.data);
          }
        } catch (error) {
          console.error("Error fetching performance data on tab change:", error);
        }
      };
      
      fetchBothPerformanceData();
    }
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Function to render performance graphs
  const renderPerformanceGraphs = () => {
    console.log("Current performanceData state:", performanceData);
    console.log("Performance history length:", performanceHistory?.length || 0);
    
    // Check if we have at least current performance data to display
    const hasPerformanceData = performanceData && Object.keys(performanceData).length > 0 && 
                              typeof performanceData.fitness === 'number';
    
    // If there's no performance data at all, show a message
    if (!hasPerformanceData) {
      return (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">No Performance Data Available</h3>
            <p className="text-gray-500 mb-4">Your performance data has not yet been recorded by your manager.</p>
          </div>
        </div>
      );
    }
    
    // Even if we don't have history, we can still show the current performance
    console.log("Rendering performance graphs with data:", performanceData);
    
    // Use history if available, or create a basic history with just the current data
    const historyToUse = performanceHistory && performanceHistory.length > 0 ? 
      performanceHistory : 
      [{...performanceData, updatedAt: new Date()}];
    
    // Prepare data for line chart - ensure we sort by date first
    const sortedHistory = [...historyToUse].sort((a, b) => 
      new Date(a.updatedAt) - new Date(b.updatedAt)
    );

    const lineChartData = {
      labels: sortedHistory.map(p => new Date(p.updatedAt).toLocaleDateString()),
      datasets: [
        {
          label: 'Fitness',
          data: sortedHistory.map(p => p.fitness),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.3 // Add some curve to the lines
        },
        {
          label: 'Technique',
          data: sortedHistory.map(p => p.technique),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.3
        },
        {
          label: 'Teamwork',
          data: sortedHistory.map(p => p.teamwork),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.3
        },
        {
          label: 'Consistency',
          data: sortedHistory.map(p => p.consistency),
          borderColor: 'rgb(255, 206, 86)',
          backgroundColor: 'rgba(255, 206, 86, 0.5)',
          tension: 0.3
        },
        {
          label: 'Discipline',
          data: sortedHistory.map(p => p.discipline),
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          tension: 0.3
        }
      ],
    };

    // Prepare data for bar chart (current performance)
    const barChartData = {
      labels: ['Fitness', 'Technique', 'Teamwork', 'Consistency', 'Discipline'],
      datasets: [
        {
          label: 'Current Performance',
          data: [
            performanceData.fitness || 0,
            performanceData.technique || 0,
            performanceData.teamwork || 0,
            performanceData.consistency || 0,
            performanceData.discipline || 0,
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(53, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(200, 200, 200, 0.2)'
          }
        },
        x: {
          grid: {
            color: 'rgba(200, 200, 200, 0.2)'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 10,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.7)',
          titleFont: {
            size: 13
          },
          bodyFont: {
            size: 12
          },
          padding: 10,
          cornerRadius: 3
        }
      }
    };

    return (
      <div className="space-y-8">
        {/* Overall Performance Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Performance Overview</h3>
            {performanceData.updatedAt && (
              <span className="text-sm text-gray-500">
                Last updated: {new Date(performanceData.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Fitness</div>
              <div className="text-2xl font-bold text-indigo-600">{performanceData.fitness}</div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${performanceData.fitness}%` }}></div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Technique</div>
              <div className="text-2xl font-bold text-blue-600">{performanceData.technique}</div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${performanceData.technique}%` }}></div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Teamwork</div>
              <div className="text-2xl font-bold text-teal-600">{performanceData.teamwork}</div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${performanceData.teamwork}%` }}></div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Consistency</div>
              <div className="text-2xl font-bold text-yellow-600">{performanceData.consistency}</div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${performanceData.consistency}%` }}></div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Discipline</div>
              <div className="text-2xl font-bold text-purple-600">{performanceData.discipline}</div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${performanceData.discipline}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Overall Performance</div>
            <div className="text-3xl font-bold text-gray-800">
              {Math.round((performanceData.fitness + performanceData.technique + performanceData.teamwork + performanceData.consistency + performanceData.discipline) / 5)}
            </div>
          </div>
        </div>

        {/* Performance Progress Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Performance Progress</h3>
          <div className="h-80">
            <Line 
              data={lineChartData} 
              options={chartOptions}
            />
          </div>
        </div>

        {/* Current Performance Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Current Performance</h3>
          <div className="h-64">
            <Bar 
              data={barChartData} 
              options={chartOptions}
            />
          </div>
        </div>

        {/* Add notes section if available */}
        {performanceData.notes && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Manager's Notes</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{performanceData.notes}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Format date for display
  const formatEventDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };
  
  // Function to render team and manager info
  const renderTeamAndManagerInfo = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Team Information</h3>
          {teamInfo ? (
            <div>
              <p className="text-xl font-bold text-indigo-600">{teamInfo.name}</p>
              <p className="text-gray-600 mt-2">Total Players: {teamInfo.players?.length || 0}</p>
              {/* Add more team info as needed */}
            </div>
          ) : (
            <p className="text-gray-600">You are not currently assigned to any team.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Manager Information</h3>
          {managerInfo ? (
            <div>
              <p className="text-xl font-bold text-indigo-600">{managerInfo.username}</p>
              <p className="text-gray-600 mt-2">Email: {managerInfo.email}</p>
              {/* Add more manager info as needed */}
            </div>
          ) : (
            <p className="text-gray-600">Manager information not available.</p>
          )}
        </div>
      </div>
    );
  };

  // Function to render training sessions
  const renderTrainingSessions = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-2xl font-semibold mb-6">Upcoming Training Sessions</h3>
        
        {trainingSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trainingSessions.map((session) => {
                  // Calculate duration in hours and minutes
                  const start = new Date(session.startDateTime);
                  const end = new Date(session.endDateTime);
                  const durationMs = end - start;
                  const hours = Math.floor(durationMs / (1000 * 60 * 60));
                  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                  const duration = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
                  
                  // Determine if the session is today
                  const today = new Date();
                  const isToday = start.toDateString() === today.toDateString();
                  
                  // Get appropriate background color based on training type
                  const getTypeColor = (type) => {
                    switch(type) {
                      case 'Fitness': return 'bg-red-100 text-red-800';
                      case 'Technical': return 'bg-blue-100 text-blue-800';
                      case 'Tactical': return 'bg-indigo-100 text-indigo-800';
                      case 'Recovery': return 'bg-green-100 text-green-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };
                  
                  return (
                    <tr key={session._id} className={isToday ? 'bg-indigo-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-14 w-14 bg-indigo-100 rounded-md flex flex-col items-center justify-center text-center">
                            <span className="text-xs font-medium text-indigo-600">
                              {start.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
                            </span>
                            <span className="text-lg font-bold text-indigo-800">
                              {start.getDate()}
                            </span>
                            {isToday && (
                              <span className="text-xs font-medium text-white bg-indigo-600 px-2 py-0.5 rounded-sm mt-0.5">
                                TODAY
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-sm text-gray-500">
                              to {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{session.title}</div>
                        {session.description && (
                          <div className="text-sm text-gray-500 max-w-xs truncate" title={session.description}>
                            {session.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(session.type)}`}>
                          {session.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {duration}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-600">No upcoming training sessions scheduled.</p>
            <p className="text-sm text-gray-500 mt-2">Check back later or contact your manager.</p>
          </div>
        )}
      </div>
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'manager':
        return 'text-green-600';
      case 'coach':
        return 'text-blue-600';
      case 'player':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleSendMessage = () => {
    // Placeholder for message sending functionality
    console.log("Sending message:", newMessage);
    setNewMessage('');
  };

  if (loading) return <div>Loading player dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed h-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Player Portal</h2>
          <p className="text-gray-500">
            Welcome, {userData ? userData.username : "Player"}
          </p>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {["Overview", "Training", "Events", "Performance", "Chat"].map(
            (item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item.toLowerCase())}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.toLowerCase()
                    ? "bg-indigo-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            )
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 mt-4 rounded-lg"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8 w-full">
        <div className="flex justify-end items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mr-100">
              Player Dashboard
            </h1>
            <p className="text-gray-500">Track your performance and schedule</p>
          </div>
          <Link
            to="/chat"
            className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow mr-10"
          >
            <span className="text-gray-600"> Chat</span>
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <IoMdNotificationsOutline size={28} className="text-gray-700" />
              {notifications.some((n) => !n.read) && (
                <>
                  {/* Notification count badge */}
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                  
                  {/* Pulse animation for new notifications */}
                  <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75" 
                    style={{ animationDuration: '1.5s', animationIterationCount: '3' }}></span>
                </>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-lg z-10 overflow-hidden">
                <div className="bg-indigo-500 text-white py-2 px-4">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                </div>
                
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="mb-2">
                      <IoMdNotificationsOutline size={40} className="mx-auto text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <ul className="divide-y divide-gray-200">
                      {notifications.map((notif) => (
                        <li
                          key={notif._id}
                          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            notif.read ? 'opacity-70' : 'border-l-4 border-indigo-500'
                          }`}
                          onClick={() => markAsRead(notif._id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className={`text-sm ${notif.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                {notif.message}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(notif.createdAt).toLocaleString()}
                              </div>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1"></div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="border-t p-2 text-center">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
            
            {/* Team and Manager Info */}
            {renderTeamAndManagerInfo()}
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {performanceStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                  <p className="text-green-500 text-sm mt-1">{stat.change}</p>
                </div>
              ))}
            </div>
            
            {/* Recent Training */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Upcoming Training Sessions</h3>
                <button 
                  onClick={() => setActiveTab("training")}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View All
                </button>
              </div>
              
              {trainingSessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Session
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Show only the next 3 training sessions */}
                      {[...trainingSessions]
                        .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime))
                        .slice(0, 3)
                        .map((session) => {
                          const start = new Date(session.startDateTime);
                          const isToday = start.toDateString() === new Date().toDateString();
                          
                          // Get appropriate background color based on training type
                          const getTypeColor = (type) => {
                            switch(type) {
                              case 'Fitness': return 'bg-red-100 text-red-800';
                              case 'Technical': return 'bg-blue-100 text-blue-800';
                              case 'Tactical': return 'bg-indigo-100 text-indigo-800';
                              case 'Recovery': return 'bg-green-100 text-green-800';
                              default: return 'bg-gray-100 text-gray-800';
                            }
                          };
                          
                          return (
                            <tr key={session._id} className={isToday ? 'bg-indigo-50' : ''}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-md flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-medium text-indigo-600">
                                      {start.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
                                    </span>
                                    <span className="text-lg font-bold text-indigo-800">
                                      {start.getDate()}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{session.title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(session.type)}`}>
                                  {session.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {session.location}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-600">No upcoming training sessions scheduled.</p>
                  <p className="text-sm text-gray-500 mt-2">Check with your manager for the latest updates.</p>
                </div>
              )}
            </div>
            
            {/* Events Display Section */}
            {events.length > 0 && (
              <div className="mb-8 bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Events</h2>
                <div className="space-y-4">
                  {events.slice(0, 3).map((event) => (
                    <div key={event._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div>
                        <h3 className="font-medium text-gray-800">{event.title}</h3>
                        <p className="text-gray-500 text-sm">{event.location}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-indigo-600">{formatEventDate(event.date)}</span>
                      </div>
                    </div>
                  ))}
                  {events.length > 3 && (
                    <button 
                      onClick={() => setActiveTab("events")}
                      className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
                    >
                      View all events
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div
            className="bg-white rounded-xl shadow-md p-6 overflow-x-auto"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Match Schedule
            </h2>
            <table className="min-w-full table-auto border border-gray-200 rounded-xl">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Opponent</th>
                  <th className="px-4 py-2 text-left">Event</th>
                  <th className="px-4 py-2 text-left">Tournament</th>
                  <th className="px-4 py-2 text-left">Organiser</th>
                </tr>
              </thead>
              <tbody>
                {schedule.length > 0 ? (
                  schedule.map((match, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{match.date}</td>
                      <td className="px-4 py-2">{match.time}</td>
                      <td className="px-4 py-2">{match.opponent}</td>
                      <td className="px-4 py-2">{match.event}</td>
                      <td className="px-4 py-2">{match.tournament}</td>
                      <td className="px-4 py-2">{match.organiser}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No upcoming matches scheduled</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Training Tab */}
        {activeTab === "training" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Training Schedule</h1>
            {trainingSessions.length > 0 ? (
              renderTrainingSessions()
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Training Sessions</h3>
                <p className="mt-2 text-gray-500">You don't have any upcoming training sessions scheduled.</p>
                <p className="mt-1 text-gray-500">Check back later or contact your team manager.</p>
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Team Events</h1>
            {events.length > 0 ? (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event._id} className="flex flex-col p-5 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-gray-800 text-lg">{event.title}</h3>
                          <p className="text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                          <p className="text-gray-500 mt-2">
                            <span className="inline-flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                              {event.location}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-indigo-600 block mb-1">{formatEventDate(event.date)}</span>
                          {event.time && <span className="text-gray-500 text-sm">{event.time}</span>}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Link 
                          to={`/player/events/${event._id}`}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          View Details
                        </Link>
                        <button 
                          onClick={() => navigate(`/player/events/${event._id}`)}
                          className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm transition-colors">
                          Register
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Events Scheduled</h3>
                <p className="mt-2 text-gray-500">There are no upcoming events at this time.</p>
                <p className="mt-1 text-gray-500">Check back later for updates from your team administration.</p>
              </div>
            )}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === "performance" && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Performance Analytics</h1>
            {renderPerformanceGraphs()}
          </div>
        )}

        {/* Chat Tab */}

        {activeTab === "chat" && (
          <div
            className="bg-white rounded-xl shadow-md p-6"
          >
       <div className="">
      <nav className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Team Chat</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg">
          {/* Messages Container */}
          <div className="h-[600px] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${
                  message.sender === 'You' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {message.sender}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(message.role)}`}>
                    {message.role}
                  </span>
                </div>
                <div
                  className={`max-w-sm rounded-lg p-3 ${
                    message.sender === 'You'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">{message.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDashboard;
