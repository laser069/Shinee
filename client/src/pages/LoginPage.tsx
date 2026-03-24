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
      <div className="bg-white border-4 border-[#0A0A0A] p-10 rounded-3xl shadow-[12px_12px_0px_0px_rgba(10,10,10,1)]">
        <header className="text-center mb-10">
           <div className="w-16 h-16 bg-[#0A0A0A] rounded-2xl mx-auto mb-6 flex items-center justify-center">
             <Lock className="w-8 h-8 text-white" />
           </div>
           <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tight">Welcome Back</h2>
           <p className="text-[#0A0A0A]/60 mt-2 font-bold">Continue your productivity journey.</p>
        </header>
        
        {error && (
          <div className="bg-rose-500 text-white p-4 rounded-xl text-sm mb-6 flex items-center gap-2 font-bold">
            {error}
          </div>
        )}
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-black text-[#0A0A0A] mb-2 ml-1 uppercase tracking-widest text-[10px]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0A0A0A]" />
              <input
                name="email"
                type="email"
                required
                className="w-full bg-white border-4 border-[#0A0A0A] rounded-2xl pl-12 pr-4 py-4 text-[#0A0A0A] focus:bg-[#F5C842]/10 outline-none transition-all placeholder:text-[#0A0A0A]/30 font-bold"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-[#0A0A0A] mb-2 ml-1 uppercase tracking-widest text-[10px]">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0A0A0A]" />
              <input
                name="password"
                type="password"
                required
                className="w-full bg-white border-4 border-[#0A0A0A] rounded-2xl pl-12 pr-4 py-4 text-[#0A0A0A] focus:bg-[#F5C842]/10 outline-none transition-all placeholder:text-[#0A0A0A]/30 font-bold"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0A0A0A] hover:bg-[#F5C842] hover:text-[#0A0A0A] text-white font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Sign In Now'}
            {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
          
          <div className="text-center pt-4">
            <Link to="/register" className="text-sm font-black text-[#0A0A0A] hover:text-[#F5C842] transition-colors">
              New to Shinee? <span className="underline decoration-[#F5C842] underline-offset-4">Create an account</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};