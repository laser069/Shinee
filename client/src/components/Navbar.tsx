import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <nav className="w-full border-b border-border/10 bg-bg sticky top-0 z-50">
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
                className="text-fg hover:text-[#F5C842] font-bold transition-colors"
              >
                Boards
              </button>

              <button
                onClick={() => navigate('/habits')}
                className="text-fg hover:text-[#F5C842] font-bold transition-colors"
              >
                Habits
              </button>

              <button
                onClick={() => navigate('/stats')}
                className="text-fg hover:text-[#F5C842] font-bold transition-colors"
              >
                Stats
              </button>

              <span className="text-fg/60 font-medium italic">
                Hi, <span className="text-fg not-italic font-bold">{user?.name}</span>
              </span>

              <button onClick={() => navigate('/profile')} className="text-fg font-bold hover:text-[#F5C842] transition-colors">
                Profile
              </button>

              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-lg border-2 border-border text-fg hover:bg-[#F5C842] hover:text-[#0A0A0A] transition-all"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={logout}
                className="bg-fg text-bg px-4 py-2 rounded-lg hover:bg-[#F5C842] hover:text-[#0A0A0A] font-bold transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-lg border-2 border-border text-fg hover:bg-[#F5C842] hover:text-[#0A0A0A] transition-all"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => navigate('/login')} className="font-bold text-fg hover:text-[#F5C842]">
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-fg px-6 py-2.5 rounded-xl font-bold text-bg hover:bg-[#F5C842] hover:text-[#0A0A0A] transition-all active:scale-95 shadow-md"
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
