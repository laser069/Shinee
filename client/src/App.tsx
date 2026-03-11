import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import BoardDetailsPage from './pages/BoardDetailsPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-200 overflow-x-hidden">
      <Navbar />

       <main className="w-full relative flex-1">
        {/* Visual Background Flair */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

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
const HomeHero = () => (
  <div className="text-center animate-in fade-in zoom-in duration-700">
    <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter">
      UNLIMITED <br /> 
      <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        POSSIBILITIES.
      </span>
    </h1>
    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
      Experience the next generation of web management. Clean, fast, and fully responsive from edge to edge.
    </p>
    <div className="flex flex-wrap justify-center gap-4">
       <button className="px-10 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-200 transition-all shadow-xl shadow-white/5">
         Get Started Today
       </button>
       <button className="px-10 py-4 bg-slate-800 text-white font-bold rounded-2xl border border-slate-700 hover:bg-slate-700 transition-all">
         View Documentation
       </button>
    </div>
  </div>
);

export default App; 