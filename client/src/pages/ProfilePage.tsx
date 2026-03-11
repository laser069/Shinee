import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import type { User } from '../types';
import { Shield, Mail, User as UserIcon, Calendar, ArrowRight } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user: authUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        if (isMounted) setProfile(data);
      } catch (err) {
        console.error('Failed to synchronize profile data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  const displayUser = profile || authUser;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <UserIcon className="w-8 h-8 text-indigo-500" />
          Settings
        </h1>
        <p className="text-slate-400 mt-2 font-medium">Personalize your Nexus experience and account details.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-6 mb-8 border-b border-slate-700/50 pb-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-500/20">
                {displayUser?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{displayUser?.name}</h2>
                <div className="flex items-center gap-2 text-slate-400 mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{displayUser?.email}</span>
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <ProfileItem 
                icon={<UserIcon className="w-4 h-4 text-indigo-400" />}
                label="Display Name" 
                value={displayUser?.name} 
              />
              <ProfileItem 
                icon={<Mail className="w-4 h-4 text-indigo-400" />}
                label="Email Address" 
                value={displayUser?.email} 
              />
              <ProfileItem 
                icon={<Shield className="w-4 h-4 text-indigo-400" />}
                label="Access Level" 
                value={isAdmin ? 'Administrator' : 'Standard User'} 
              />
              <ProfileItem 
                icon={<Calendar className="w-4 h-4 text-indigo-400" />}
                label="Member Since" 
                value={displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'} 
              />
            </dl>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-rose-400 font-bold mb-2 uppercase text-xs tracking-widest">Danger Zone</h3>
            <p className="text-slate-500 text-sm mb-6">Once you sign out, you will need to re-authenticate to access your boards and habits.</p>
            <button
              onClick={logout}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-rose-500/20 active:scale-95"
            >
              Sign Out Account
            </button>
          </div>
        </div>

        {/* Quick Links / Stats */}
        <div className="space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-white font-bold mb-4">Quick Stats</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl">
                  <span className="text-slate-400 text-sm">Status</span>
                  <span className="text-emerald-400 text-sm font-bold flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
               </div>
               <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl">
                  <span className="text-slate-400 text-sm">Account Type</span>
                  <span className="text-indigo-400 text-sm font-bold">{isAdmin ? 'Pro' : 'Free'}</span>
               </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 p-4 rounded-3xl font-bold flex items-center justify-between group hover:bg-indigo-500/20 transition-all"
          >
            Go to Boards
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) => (
  <div>
    <dt className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
      {icon}
      {label}
    </dt>
    <dd className="text-xl font-bold text-white">{value || 'Not provided'}</dd>
  </div>
);

export default ProfilePage;