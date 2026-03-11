import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user ,login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      console.log("Login failed", err);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="bg-[#1e293b]/50 border border-slate-700/50 p-10 rounded-3xl backdrop-blur-xl shadow-2xl">
        <header className="text-center mb-10">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/20 mx-auto mb-6 flex items-center justify-center">
             <Lock className="w-8 h-8 text-white" />
           </div>
           <h2 className="text-3xl font-black text-white tracking-tight">Welcome Back</h2>
           <p className="text-slate-400 mt-2 font-medium">Continue your productivity journey.</p>
        </header>
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-sm mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            {error}
          </div>
        )}
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest text-[10px]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                name="email"
                type="email"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest text-[10px]">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                name="password"
                type="password"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Sign In Now'}
            {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
          
          <div className="text-center pt-4">
            <Link to="/register" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              New to Nexus? <span className="underline decoration-indigo-500/30 underline-offset-4">Create an account</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};