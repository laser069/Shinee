import { Routes, Route, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { PomodoroWidget } from './components/PomodoroWidget';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import BoardDetailsPage from './pages/BoardDetailsPage';
import DashboardPage from './pages/DashboardPage';
import HabitsPage from './pages/HabitsPage';
import StatsPage from './pages/StatsPage';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen w-full bg-white text-[#0A0A0A] overflow-x-hidden">
      <Navbar />
      {isAuthenticated && <PomodoroWidget />}

       <main className="w-full relative flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<div className="w-full max-w-7xl mx-auto px-6 py-12"><HomeHero /></div>} />
          <Route path="/login" element={<div className="w-full max-w-lg mx-auto px-6 py-12"><LoginPage /></div>} />
          <Route path="/register" element={<div className="w-full max-w-lg mx-auto px-6 py-12"><RegisterPage /></div>} />

          {/* Protected Application Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <div className="w-full max-w-7xl mx-auto px-6 py-12">
                  <DashboardPage />
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/board/:id" 
            element={
              <ProtectedRoute>
                <div className="w-full h-[calc(100vh-80px)]">
                  <BoardDetailsPage />
                </div>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/habits" 
            element={
              <ProtectedRoute>
                <div className="w-full h-[calc(100vh-80px)] overflow-y-auto">
                  <HabitsPage />
                </div>
              </ProtectedRoute>
            } 
          />

          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <StatsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="w-full max-w-4xl mx-auto px-6 py-12">
                  <ProfilePage />
                </div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

// Separate the Hero into a component for cleanliness
const HomeHero = () => {
  const navigate = useNavigate();
  return (
    <div className="text-center animate-in fade-in zoom-in duration-700">
      <h1 className="text-6xl md:text-8xl font-black text-[#0A0A0A] mb-8 tracking-tighter">
        MASTER YOUR <br /> 
        <span className="text-[#F5C842] uppercase">
          ROUTINE.
        </span>
      </h1>
      <p className="text-xl text-[#0A0A0A]/60 max-w-2xl mx-auto mb-10 leading-relaxed font-bold">
        The ultimate productivity hub. Manage high-intensity Kanban boards and professional habit trackers in one unified workspace.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
         <button 
           onClick={() => navigate('/register')}
           className="px-10 py-4 bg-[#0A0A0A] text-white font-black rounded-2xl hover:bg-[#F5C842] hover:text-[#0A0A0A] transition-all shadow-xl shadow-black/10"
         >
           Get Started Today
         </button>
         <button 
           onClick={() => navigate('/login')}
           className="px-10 py-4 bg-white text-[#0A0A0A] font-black rounded-2xl border-4 border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all flex items-center gap-2"
         >
           Sign In
         </button>
      </div>
    </div>
  );
};

export default App; 