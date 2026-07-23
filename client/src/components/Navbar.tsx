import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="w-full border-b border-[#0A0A0A]/10 bg-white sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo - Navigates to Dashboard if logged in, otherwise Home */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        >
          <div className="bg-[#0A0A0A] px-4 py-2 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-xl font-black tracking-tighter text-white flex logo-font">
              SH<span className="text-[#F5C842]">I</span>NEE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              {/* Added Dashboard Link */}
              <button 
                onClick={() => navigate('/dashboard')} 
                className="text-[#0A0A0A] hover:text-[#F5C842] font-bold transition-colors"
              >
                Boards
              </button>
              
              <button 
                onClick={() => navigate('/habits')} 
                className="text-[#0A0A0A] hover:text-[#F5C842] font-bold transition-colors"
              >
                Habits
              </button>
              
              <button
                onClick={() => navigate('/stats')}
                className="text-[#0A0A0A] hover:text-[#F5C842] font-bold transition-colors"
              >
                Stats
              </button>

              <button
                onClick={() => navigate('/calendar')}
                className="text-[#0A0A0A] hover:text-[#F5C842] font-bold transition-colors"
              >
                Calendar
              </button>

              <button
                onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
                className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#0A0A0A]/20 rounded-lg text-[#0A0A0A]/50 hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors text-xs font-black"
                title="Search (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5" /> Ctrl+K
              </button>

              <span className="text-[#0A0A0A]/60 font-medium italic">
                Hi, <span className="text-[#0A0A0A] not-italic font-bold">{user?.name}</span>
              </span>
              
              <button onClick={() => navigate('/profile')} className="text-[#0A0A0A] font-bold hover:text-[#F5C842] transition-colors">
                Profile
              </button>
              
              <button 
                onClick={logout} 
                className="bg-[#0A0A0A] text-white px-4 py-2 rounded-lg hover:bg-[#F5C842] hover:text-[#0A0A0A] font-bold transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/login')} className="font-bold text-[#0A0A0A] hover:text-[#F5C842]">
                Login
              </button>
              <button 
                onClick={() => navigate('/register')} 
                className="bg-[#0A0A0A] px-6 py-2.5 rounded-xl font-bold text-white hover:bg-[#F5C842] hover:text-[#0A0A0A] transition-all active:scale-95 shadow-md"
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