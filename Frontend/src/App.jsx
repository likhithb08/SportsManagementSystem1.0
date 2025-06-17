import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PlayerDashboard from './components/player/PlayerDashboard';
import EventDetails from './components/player/EventDetails';
import PlayerProfile from './components/player/PlayerProfile';
import AdminDashboard from './components/admin/AdminDashboard';
import EventForm from './components/admin/EventForm';
import ManagerDashboard from './components/manager/ManagerDashboard';
import CreateTeam from './components/manager/CreateTeam';
import TeamDetails from './components/manager/TeamDetails';
import PlayerPerformance from './components/manager/PlayerPerformance';
import TrainingSchedule from './components/manager/TrainingSchedule';
import MatchSchedule from './components/manager/MatchSchedule';
import Chat from './components/Chat';

// Simple NotFound component for 404 routes
const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-6">The page you are looking for does not exist or has been moved.</p>
        <a 
          href="/" 
          className="inline-block px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="player/dashboard" element={<PlayerDashboard />} />
        <Route path="player/events/:eventId" element={<EventDetails />} />
        <Route path="player/profile/:playerId" element={<PlayerProfile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events/new" element={<EventForm />} />
        <Route path="/admin/events/:eventId" element={<EventForm />} />
        <Route path="/admin/events/:eventId/edit" element={<EventForm />} />
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/team/create" element={<CreateTeam />} />
        <Route path="/manager/team/:teamId" element={<TeamDetails />} />
        <Route path="/manager/player/:playerId/performance" element={<PlayerPerformance />} />
        <Route path="/manager/training" element={<TrainingSchedule />} />
        <Route path="/manager/matches" element={<MatchSchedule />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
