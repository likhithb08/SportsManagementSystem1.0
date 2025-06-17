import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AdminDashboard component mounted');
    
    // First, check if user info is in session storage
    const sessionUser = sessionStorage.getItem('user');
    console.log('Session user data:', sessionUser);
    let user = null;
    
    if (sessionUser) {
      try {
        user = JSON.parse(sessionUser);
        console.log('Parsed user:', user);
        
        // Check if user is an admin
        if (user.role !== 'admin') {
          console.log('User is not an admin, redirecting to login');
          setError('You do not have admin privileges');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
      } catch (error) {
        console.error('Failed to parse session user:', error);
      }
    }

    if (!user) {
      console.log('No user in session, redirecting to login');
      // No user in session, redirect to login
      navigate('/login');
      return;
    }

    // Set user data from session
    setUserData(user);
    console.log('User data set in state:', user);
    
    // Fetch dashboard data
    fetchDashboardData();
    
    // Fetch events data
    fetchEvents();
    
    setLoading(false);
  }, [navigate]);

  const fetchDashboardData = async () => {
    console.log('Fetching dashboard data...');
    // Generate placeholder data if we can't fetch from server
    const placeholderStats = [
      { title: 'Total Athletes', value: '124', change: '+12%' },
      { title: 'Active Teams', value: '8', change: '+2%' },
      { title: 'Upcoming Events', value: '6', change: '+3%' },
      { title: 'Notifications', value: '24', change: '+5%' }
    ];

    const placeholderActivities = [
      { type: 'New Athlete', message: 'John Doe joined the platform', time: '2h ago' },
      { type: 'Event Scheduled', message: 'Tournament scheduled for next month', time: '4h ago' },
      { type: 'System Update', message: 'Platform updated to version 2.1', time: '1d ago' },
      { type: 'Team Created', message: 'New team "Eagles" created', time: '2d ago' }
    ];

    try {
      // Try to fetch real data from API
      console.log('Making API request to admin dashboard endpoint...');
      const res = await axios.get('http://localhost:5000/api/admin/dashboard', { 
        withCredentials: true 
      });
      
      console.log('Dashboard API response:', res);
      
      if (res.data && res.data.stats) {
        console.log('Using real stats data from API');
        setStats(res.data.stats);
        setRecentActivities(res.data.activities || []);
      } else {
        console.log('API response did not contain expected data, using placeholders');
        // Fallback to placeholder data
        setStats(placeholderStats);
        setRecentActivities(placeholderActivities);
      }
    } catch (error) {
      console.error('Error fetching dashboard data, using placeholders:', error);
      // Fallback to placeholder data
      setStats(placeholderStats);
      setRecentActivities(placeholderActivities);
    }
  };

  const fetchEvents = async () => {
    console.log('Fetching events data...');
    try {
      console.log('Making API request to events endpoint...');
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
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      // Set empty array on error
      setEvents([]);
    }
  };

  // Function to handle event deletion
  const handleDeleteEvent = async (eventId) => {
    try {
      console.log('Deleting event with ID:', eventId);
      const response = await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        withCredentials: true
      });
      
      if (response.data && response.data.success) {
        console.log('Event deleted successfully');
        // Remove the deleted event from the events array
        setEvents(events.filter(event => event._id !== eventId));
      } else {
        console.error('Failed to delete event:', response.data);
        alert('Failed to delete event. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('An error occurred while deleting the event. Please try again.');
    }
  };

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const handleAddNew = () => {
    switch (activeTab) {
      case 'users':
        navigate('/admin/users/new');
        break;
      case 'teams':
        navigate('/admin/teams/new');
        break;
      case 'events':
        navigate('/admin/events/new');
        break;
      default:
        console.log('Add new clicked for tab:', activeTab);
    }
  };

  // Format date for display
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="h-16 w-16 text-red-500 mx-auto mb-4">⚠️</div>
          <p className="text-gray-800 text-xl font-semibold mb-2">Error</p>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => navigate('/login')} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="h-16 w-16 text-red-500 mx-auto mb-4">⚠️</div>
          <p className="text-gray-800 text-xl font-semibold mb-2">Not authorized</p>
          <p className="text-gray-600">You need to login as an admin to access this page</p>
          <button 
            onClick={() => navigate('/login')} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Event list component for the events tab
  const EventsList = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
        <button
          onClick={() => navigate('/admin/events/new')}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          + Add Event
        </button>
      </div>
      
      {events.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-600 mb-4">No events have been created yet.</p>
          <button
            onClick={() => navigate('/admin/events/new')}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg"
          >
            Create Your First Event
          </button>
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
                  onClick={() => navigate(`/admin/events/${event._id}`)}
                >
                  View Details
                </button>
                <button 
                  className="px-3 py-1 text-xs border border-indigo-300 rounded text-indigo-600 hover:bg-indigo-50"
                  onClick={() => navigate(`/admin/events/${event._id}/edit`)}
                >
                  Edit
                </button>
                <button 
                  className="px-3 py-1 text-xs border border-red-300 rounded text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this event?')) {
                      handleDeleteEvent(event._id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Dashboard Overview component
  const DashboardOverview = () => (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
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

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-medium text-gray-800">{activity.type}</h3>
                <p className="text-gray-500 text-sm">{activity.message}</p>
              </div>
              <span className="text-sm text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events Preview */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
          <Link to="/admin/events" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View All
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          {events.length > 0 ? (
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
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming events</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 ml-120">
        <button
          onClick={() => navigate('/admin/events/new')}
          className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="font-medium text-gray-800">Schedule Event</h3>
          <p className="text-gray-500 text-sm mt-1">Create and manage sports events</p>
        </button>
      </div>
    </>
  );

  // Render the main dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
          <p className="text-gray-500">Welcome, {userData.username || userData.name}</p>
        </div>
        <nav className="mt-6">
          <div className="px-4 space-y-2">
            {['Overview',  'Events'].map((item) => (
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
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left rounded-lg transition-colors text-red-600 hover:bg-red-50 mt-4"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {activeTab === 'events' ? 'Events Management' : 
               activeTab === 'users' ? 'User Management' : 
               activeTab === 'settings' ? 'Settings' : 
               activeTab === 'reports' ? 'Reports' : 
               'Dashboard Overview'}
            </h1>
            <p className="text-gray-500">
              {activeTab === 'events' ? 'Create and manage sports events' : 
               activeTab === 'users' ? 'Manage user accounts and permissions' : 
               activeTab === 'settings' ? 'Configure system settings' : 
               activeTab === 'reports' ? 'View and generate reports' : 
               'Monitor and manage your sports organization'}
            </p>
          </div>
          <div className="space-x-4">
            <button className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <span className="text-gray-600">Notifications</span>
            </button>
            <Link to="/chat" className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <span className="text-gray-600">Chat</span>
            </Link>
            {activeTab !== 'overview' && (
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                {activeTab === 'events' ? '+ Add Event' : 
                 activeTab === 'users' ? '+ Add User' : 
                 '+ Add New'}
              </button>
            )}
          </div>
        </div>

        {/* Conditional rendering based on active tab */}
        {activeTab === 'overview' && <DashboardOverview />}
        {activeTab === 'events' && <EventsList />}
        {activeTab === 'users' && <div>User management content will go here</div>}
        {activeTab === 'settings' && <div>Settings content will go here</div>}
        {activeTab === 'reports' && <div>Reports content will go here</div>}
      </div>
    </div>
  );
};

export default AdminDashboard;

// const admin = () =>{}