import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate(); // Use the hook instead of window.history

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-200 overflow-x-hidden">
      <nav className="w-full border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-black tracking-tighter text-white">NEXUS</span>
          </div>

          <div className="flex items-center gap-8">
            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <span className="text-slate-400 font-medium italic">Hi, <span className="text-indigo-400 not-italic font-bold">{user?.name}</span></span>
                <button onClick={() => navigate('/profile')} className="hover:text-indigo-400 transition-colors">Profile</button>
                <button onClick={logout} className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">Logout</button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/login')} className="font-semibold hover:text-white">Login</button>
                <button onClick={() => navigate('/register')} className="bg-indigo-600 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95">Join Now</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="w-full min-h-[calc(100vh-80px)] relative flex flex-col items-center justify-center">
        {/* Visual Background Flair */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-7xl px-6 py-12">
          {/* REPLACE THE CONDITIONAL RENDERING WITH THIS: */}
          <Routes>
            <Route path="/" element={<HomeHero />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
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