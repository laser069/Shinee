import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return 0;
    let score = 0;
    if (pw.length > 6) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    if (validationError) setValidationError(null);
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setValidationError('Passwords do not match');
    }
    if (formData.password.length < 8) {
      return setValidationError('Minimum 8 characters required');
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err) {}
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white border-4 border-[#0A0A0A] p-10 rounded-3xl shadow-[12px_12px_0px_0px_rgba(10,10,10,1)] max-w-lg mx-auto">
        <header className="text-center mb-10">
           <div className="w-16 h-16 bg-[#0A0A0A] rounded-2xl mx-auto mb-6 flex items-center justify-center text-white">
             <UserPlus className="w-8 h-8" />
           </div>
           <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tight">Join Shinee</h2>
           <p className="text-[#0A0A0A]/60 mt-2 font-bold">Start your journey to peak productivity.</p>
        </header>

        {(error || validationError) && (
          <div className="bg-rose-500 text-white p-4 rounded-xl text-sm mb-6 flex items-center gap-2 font-bold">
            {error || validationError}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-black text-[#0A0A0A] mb-2 ml-1 uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0A0A0A]" />
              <input
                name="name"
                type="text"
                required
                className="w-full bg-white border-4 border-[#0A0A0A] rounded-2xl pl-12 pr-4 py-4 text-[#0A0A0A] focus:bg-[#F5C842]/10 outline-none transition-all placeholder:text-[#0A0A0A]/30 font-bold"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#0A0A0A] mb-2 ml-1 uppercase tracking-widest">Email Address</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-[#0A0A0A] mb-2 ml-1 uppercase tracking-widest">Security Key</label>
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
            <div>
              <label className="block text-xs font-black text-[#0A0A0A] mb-2 ml-1 uppercase tracking-widest">Confirm</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0A0A0A]" />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full bg-white border-4 border-[#0A0A0A] rounded-2xl pl-12 pr-4 py-4 text-[#0A0A0A] focus:bg-[#F5C842]/10 outline-none transition-all placeholder:text-[#0A0A0A]/30 font-bold"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Password Strength Meter */}
          <div className="flex gap-1.5 mt-2 h-2 px-1">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-full flex-1 rounded-full transition-colors duration-500 ${
                  passwordStrength >= s 
                    ? (passwordStrength === 1 ? 'bg-rose-500' : passwordStrength === 2 ? 'bg-[#F5C842]' : 'bg-emerald-500') 
                    : 'bg-slate-200'
                } border border-[#0A0A0A]`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0A0A0A] hover:bg-[#F5C842] hover:text-[#0A0A0A] text-white font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50 mt-6"
          >
            {isLoading ? 'Creating Account...' : 'Initialize Workspace'}
            {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
          
          <div className="text-center pt-4">
            <Link to="/login" className="text-sm font-black text-[#0A0A0A] hover:text-[#F5C842] transition-colors">
              Already have an account? <span className="underline decoration-[#F5C842] underline-offset-4">Sign in</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;