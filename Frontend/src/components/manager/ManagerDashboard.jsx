import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);

  const teamStats = [
    { title: 'Team Members', value: '25', change: '+2 this month' },
    { title: 'Average Performance', value: '87%', change: '+5%' },
    { title: 'Upcoming Matches', value: '3', change: 'This week' },
    { title: 'Training Sessions', value: '12', change: 'Scheduled' },
  ];

  const teamMembers = [];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/manager/me', {
          withCredentials: true,
        });
        const user = response.data;
        if (user.role === 'manager') {
          setUserData(user);
          setLoading(false);
        } else {
          setLoading(false);
          navigate('/login');
        }
      } catch (err) {
        console.log(err);
        setLoading(false);
        navigate('/login');
      }
    };

    fetchUser();
    // Fetch events when component mounts
    fetchEvents();
  }, [navigate]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/manager/teams', {
          withCredentials: true
        });
        setTeams(response.data);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };

    if (userData && userData.role === 'manager') {
      fetchTeams();
    }
  }, [userData]);
  
  // Function to fetch events from the backend
  const fetchEvents = async () => {
    try {
      console.log('Fetching events for manager dashboard...');
      const response = await axios.get('http://localhost:5000/api/events', {
        withCredentials: true
      });
      
      console.log('Events API response:', response);
      
      if (response.data && response.data.success) {
        console.log('Events fetched successfully:', response.data.data);
        setEvents(response.data.data || []);
      } else {
        // Handle alternative API response format
        console.log('Events returned as array:', response.data);
        setEvents(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      // Set empty array on error
      setEvents([]);
    }
  };
  
  // Format date for display
  const formatEventDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  const handleLogout = async () => {
    try {
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Function to handle creating a new team
  const handleCreateTeam = () => {
    navigate('/manager/team/create');
  };

  // Function to handle schedule training
  const handleScheduleTraining = () => {
    navigate('/manager/schedule/training');
  };

  // Function to handle view member
  const handleViewMember = (memberName) => {
    navigate(`/manager/player/${memberName}`);
  };

  // Function to handle edit member
  const handleEditMember = (memberName) => {
    navigate(`/manager/player/${memberName}/edit`);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
            </div>
            
            {events.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <p className="text-gray-600 mb-4">No events have been scheduled yet.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {events.map((event) => (
                  <div key={event._id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{event.title}</h3>
                        <p className="text-gray-600 mt-1">{event.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-indigo-600 font-medium">{formatEventDate(event.date)}</p>
                        <p className="text-gray-500 mt-1">{event.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex mt-4 space-x-2">
                      <button 
                        className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                        onClick={() => navigate(`/manager/events/${event._id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'teams':
        return (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Teams Management</h1>
                <p className="text-gray-500">Manage your team rosters and details</p>
              </div>
              <button
                onClick={handleCreateTeam}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:shadow-md"
              >
                Create New Team
              </button>
            </div>
            
            {teams.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <h3 className="text-xl font-medium text-gray-800 mb-2">No Teams Yet</h3>
                <p className="text-gray-500 mb-6">Create your first team to get started managing players</p>
                <button
                  onClick={handleCreateTeam}
                  className="px-6 py-3 bg-indigo-500 text-white rounded-lg shadow hover:shadow-md"
                >
                  Create Team
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <div key={team._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800">{team.name}</h3>
                      <p className="text-gray-500 mt-1">{team.players?.length || 0} Players</p>
                      
                      <div className="mt-4 flex justify-between">
                        <button
                          onClick={() => navigate(`/manager/team/${team._id}`)}
                          className="px-3 py-1 text-indigo-500 hover:text-indigo-600"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => navigate(`/manager/team/${team._id}/edit`)}
                          className="px-3 py-1 text-gray-500 hover:text-gray-600"
                        >
                          Edit Team
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      case 'overview':
      case 'schedule':
        return (
          <div className="flex flex-col space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Schedule Management</h2>
              <p className="text-gray-500 mb-6">Plan and organize training sessions and matches for your teams</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-50 p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Training Schedule</h3>
                  <p className="text-gray-600 mb-4">Create and manage training sessions for your teams</p>
                  <button
                    onClick={() => navigate('/manager/training')}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                  >
                    Manage Training
                  </button>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Match Schedule</h3>
                  <p className="text-gray-600 mb-4">Schedule upcoming matches for your teams</p>
                  <button
                    onClick={() => navigate('/manager/matches')}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    Manage Matches
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Events</h2>
              <div className="divide-y">
                {/* Sample calendar events - you can replace with actual data */}
                <div className="py-3 flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg text-center mr-4 w-16">
                    <div className="text-xs text-blue-600">FEB</div>
                    <div className="text-lg font-bold text-blue-800">18</div>
                  </div>
                  <div>
                    <div className="font-medium">Team A Fitness Training</div>
                    <div className="text-sm text-gray-500">9:00 AM - Main Field</div>
                  </div>
                </div>
                <div className="py-3 flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 p-2 rounded-lg text-center mr-4 w-16">
                    <div className="text-xs text-purple-600">FEB</div>
                    <div className="text-lg font-bold text-purple-800">20</div>
                  </div>
                  <div>
                    <div className="font-medium">Team B vs. City Rivals</div>
                    <div className="text-sm text-gray-500">3:00 PM - Central Stadium</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="flex flex-col space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Performance Tracking</h2>
              <p className="text-gray-500 mb-6">Monitor and analyze your team's performance</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Player Performance</h3>
                  <p className="text-gray-600 mb-4">Track individual player performance metrics</p>
                  <button
                    onClick={() => navigate('/manager/dashboard')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    View Player Stats
                  </button>
                </div>
                
                <div className="bg-yellow-50 p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Team Analysis</h3>
                  <p className="text-gray-600 mb-4">Analyze overall team performance and trends</p>
                  <button
                    onClick={() => navigate('/manager/dashboard')}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    View Team Stats
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Performance Updates</h2>
              <div className="divide-y">
                {/* Sample performance updates - replace with actual data */}
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 w-10 h-10 flex items-center justify-center bg-indigo-100 rounded-full">
                      <span className="font-medium text-indigo-800">AB</span>
                    </div>
                    <div>
                      <div className="font-medium">Alex Brown</div>
                      <div className="text-sm text-gray-500">Fitness score improved by 12%</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/manager/player/123/performance')}
                    className="text-indigo-500 hover:text-indigo-600"
                  >
                    View
                  </button>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 w-10 h-10 flex items-center justify-center bg-green-100 rounded-full">
                      <span className="font-medium text-green-800">SR</span>
                    </div>
                    <div>
                      <div className="font-medium">Sarah Robinson</div>
                      <div className="text-sm text-gray-500">Technique score improved by 8%</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/manager/player/456/performance')}
                    className="text-indigo-500 hover:text-indigo-600"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {teamStats.map((stat) => (
                <div
                  key={stat.title}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h3 className="text-gray-500 text-sm">{stat.title}</h3>
                  <div className="flex items-baseline mt-2">
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <span className="ml-2 text-sm text-green-500">{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Team Table */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Team Members</h2>
                <button
                  onClick={() => navigate('/manager/team/members')}
                  className="px-4 py-2 text-indigo-500 hover:text-indigo-600"
                >
                  View All Members
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4 px-4 text-gray-600">Name</th>
                      <th className="text-left py-4 px-4 text-gray-600">Position</th>
                      <th className="text-left py-4 px-4 text-gray-600">Status</th>
                      <th className="text-left py-4 px-4 text-gray-600">Performance</th>
                      <th className="text-left py-4 px-4 text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member, index) => (
                      <tr
                        key={index}
                        className="border-b last:border-b-0"
                      >
                        <td className="py-4 px-4">{member.name}</td>
                        <td className="py-4 px-4">{member.position}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              member.status === 'Active'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">{member.performance}</td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleViewMember(member.name)}
                            className="text-blue-500 hover:text-blue-600 mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditMember(member.name)}
                            className="text-gray-500 hover:text-gray-600"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => navigate('/manager/schedule/match')}
                className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md"
              >
                <h3 className="font-medium text-gray-800">Schedule Match</h3>
                <p className="text-gray-500 text-sm mt-1">Plan upcoming games</p>
              </button>
              <button
                onClick={() => navigate('/manager/training/plan')}
                className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md"
              >
                <h3 className="font-medium text-gray-800">Training Plan</h3>
                <p className="text-gray-500 text-sm mt-1">Create training schedules</p>
              </button>
              <button
                onClick={() => navigate('/manager/performance/review')}
                className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md"
              >
                <h3 className="font-medium text-gray-800">Performance Review</h3>
                <p className="text-gray-500 text-sm mt-1">Evaluate team performance</p>
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Manager Portal</h2>
          <p className="text-gray-500">Welcome, {userData ? userData.username : 'Manager'}</p>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {['Overview', 'Teams', 'Events', 'Schedule', 'Performance'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item.toLowerCase())}
              className={`w-full px-4 py-3 text-left rounded-lg transition-colors ${
                activeTab === item.toLowerCase()
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item}
            </button>
          ))}
          
          {/* Teams Section in Sidebar */}
          {teams.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Your Teams</h3>
              <div className="space-y-1">
                {teams.map((team) => (
                  <button
                    key={team._id}
                    onClick={() => {
                      setActiveTab('teams');
                      // You can add more logic here to show specific team details
                    }}
                    className="w-full px-3 py-2 text-left text-sm rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 mt-4"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p className="text-gray-500">Manage your team's performance and schedule</p>
          </div>
          <div className="space-x-4">
            <Link to='/chat' className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <span className="text-gray-600">Chat</span>
            </Link>
            {activeTab === 'overview' && (
              <button
                onClick={handleScheduleTraining}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:shadow-md"
              >
                Schedule Training
              </button>
            )}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default ManagerDashboard;
