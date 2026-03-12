import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="w-full border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo - Navigates to Dashboard if logged in, otherwise Home */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black tracking-tighter text-white">NEXUS</span>
        </div>

        <div className="flex items-center gap-8">
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              {/* Added Dashboard Link */}
              <button 
                onClick={() => navigate('/dashboard')} 
                className="text-slate-200 hover:text-indigo-400 font-medium transition-colors"
              >
                Boards
              </button>
              
              <button 
                onClick={() => navigate('/habits')} 
                className="text-slate-200 hover:text-indigo-400 font-medium transition-colors"
              >
                Habits
              </button>
              
              <span className="text-slate-400 font-medium italic">
                Hi, <span className="text-indigo-400 not-italic font-bold">{user?.name}</span>
              </span>
              
              <button onClick={() => navigate('/profile')} className="hover:text-indigo-400 transition-colors">
                Profile
              </button>
              
              <button 
                onClick={logout} 
                className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/login')} className="font-semibold hover:text-white">
                Login
              </button>
              <button 
                onClick={() => navigate('/register')} 
                className="bg-indigo-600 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95"
              >
                Join Now
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;