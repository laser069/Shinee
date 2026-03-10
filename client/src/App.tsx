import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import './App.css';

function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Handle navigation
  useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 
                className="text-xl font-bold text-gray-900 cursor-pointer"
                onClick={() => navigate('/')}
              >
                My App
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-700">
                    Welcome, {user?.name}
                  </span>
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Profile
                  </button>
                  <button
                    onClick={logout}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-x-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Simple route switching based on path */}
      <main className="py-10">
        {currentPath === '/login' && <LoginPage />}
        {currentPath === '/register' && <RegisterPage />}
        {currentPath === '/profile' && (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )}
        {currentPath === '/' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome to the App
            </h2>
            <p className="mt-4 text-gray-600">
              Please login or register to continue
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
