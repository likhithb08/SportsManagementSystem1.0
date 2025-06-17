import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EventForm = () => {
  const navigate = useNavigate();
  const { eventId } = useParams(); // Get event ID from URL if present
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Check authentication on component mount and fetch event data if in edit mode
  useEffect(() => {
    const sessionUser = sessionStorage.getItem('user');
    if (!sessionUser) {
      navigate('/login');
    } else {
      try {
        const user = JSON.parse(sessionUser);
        if (user.role !== 'admin') {
          navigate('/login');
        } else if (eventId) {
          // If eventId exists, we're in edit mode
          setIsEditMode(true);
          fetchEventData(eventId);
        }
      } catch (error) {
        console.error('Failed to parse session user:', error);
        navigate('/login');
      }
    }
  }, [navigate, eventId]);

  // Fetch event data for editing
  const fetchEventData = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/events/${id}`, {
        withCredentials: true
      });

      if (response.data && response.data.success) {
        const event = response.data.data;
        // Format date for datetime-local input
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toISOString().slice(0, 16);

        setFormData({
          title: event.title,
          description: event.description,
          date: formattedDate,
          location: event.location
        });
      } else {
        setError('Failed to fetch event data');
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Event not found or error accessing data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get user info from session for the createdBy field
      const sessionUser = sessionStorage.getItem('user');
      const user = JSON.parse(sessionUser);
      
      // Add creator ID from session if not in edit mode
      const eventData = {
        ...formData,
        ...(isEditMode ? {} : { createdBy: user._id })
      };
      
      console.log(`${isEditMode ? 'Updating' : 'Creating'} event data:`, eventData);
      
      let response;
      
      if (isEditMode) {
        // Update existing event
        response = await axios.put(`http://localhost:5000/api/events/${eventId}`, eventData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Create new event
        response = await axios.post('http://localhost:5000/api/events', eventData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      console.log('Event response:', response);

      if (response.data.success) {
        navigate('/admin/dashboard');
      } else {
        setError(response.data.message || `Failed to ${isEditMode ? 'update' : 'create'} event. Please try again.`);
      }
    } catch (err) {
      console.error(`Event ${isEditMode ? 'update' : 'creation'} error:`, err);
      setError(
        err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Event' : 'Create New Event'}</h2>
          <p className="text-gray-500">{isEditMode ? 'Update the event details' : 'Fill in the details to create a new event'}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Event Date
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-300"
            >
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm; 