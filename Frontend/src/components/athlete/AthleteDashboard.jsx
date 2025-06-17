import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AthleteDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const trainingStats = [
    { title: 'Training Hours', value: '24', change: '+3 this week' },
    { title: 'Fitness Score', value: '92%', change: '+5%' },
    { title: 'Next Event', value: '2 days', change: 'Tournament' },
    { title: 'Personal Best', value: '15.2s', change: 'New Record!' },
  ];

  const trainingSchedule = [
    { day: 'Monday', type: 'Strength', time: '09:00 AM', coach: 'Coach Mike' },
    { day: 'Wednesday', type: 'Speed', time: '10:00 AM', coach: 'Coach Sarah' },
    { day: 'Friday', type: 'Technique', time: '08:00 AM', coach: 'Coach John' },
  ];

  const progressMetrics = [
    { metric: 'Speed', current: 85, target: 90, improvement: '+3' },
    { metric: 'Strength', current: 80, target: 85, improvement: '+5' },
    { metric: 'Endurance', current: 88, target: 92, improvement: '+2' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Athlete Portal</h2>
          <p className="text-gray-500">Welcome, Sarah</p>
        </div>
        <nav className="mt-6">
          <div className="px-4 space-y-2">
            {['Overview', 'Training', 'Nutrition', 'Progress', 'Profile'].map((item) => (
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
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Training Dashboard</h1>
            <p className="text-gray-500">Track your progress and training schedule</p>
          </div>
          <div className="space-x-4">
            <button className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <span className="text-gray-600">Coach Chat</span>
            </button>
            <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:shadow-md transition-shadow">
              Log Workout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {trainingStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <h3 className="text-gray-500 text-sm">{stat.title}</h3>
              <div className="flex items-baseline mt-2">
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <span className="ml-2 text-sm text-indigo-500">{stat.change}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Training Schedule and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Training Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Training Schedule</h2>
            <div className="space-y-4">
              {trainingSchedule.map((session, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-800">{session.day}</h3>
                    <p className="text-gray-500 text-sm">{session.type} Training</p>
                    <p className="text-indigo-500 text-sm">with {session.coach}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{session.time}</p>
                    <button className="text-indigo-500 text-sm hover:text-indigo-600">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Progress Metrics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Progress Metrics</h2>
            <div className="space-y-6">
              {progressMetrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">{metric.metric}</span>
                    <span className="text-indigo-500">{metric.improvement}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(metric.current / metric.target) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current: {metric.current}</span>
                    <span className="text-gray-500">Target: {metric.target}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-800">View Nutrition Plan</h3>
            <p className="text-gray-500 text-sm mt-1">Check your meal schedule</p>
          </button>
          <button className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-800">Book Session</h3>
            <p className="text-gray-500 text-sm mt-1">Schedule training time</p>
          </button>
          <button className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-medium text-gray-800">Progress Report</h3>
            <p className="text-gray-500 text-sm mt-1">View detailed analytics</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AthleteDashboard; 