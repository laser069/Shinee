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
        <div className="w-12 h-12 rounded-full border-4 border-[#0A0A0A]/10 border-t-[#F5C842] animate-spin" />
      </div>
    );
  }

  const displayUser = profile || authUser;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-[#0A0A0A] tracking-tight flex items-center gap-3 uppercase">
          <UserIcon className="w-8 h-8 text-[#F5C842]" />
          Settings
        </h1>
        <p className="text-[#0A0A0A]/60 mt-2 font-bold">Personalize your Shinee experience and account details.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border-4 border-[#0A0A0A] rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
            <div className="flex items-center gap-6 mb-8 border-b-2 border-[#0A0A0A]/10 pb-8">
              <div className="w-24 h-24 rounded-3xl bg-[#0A0A0A] flex items-center justify-center text-4xl font-black text-[#F5C842]">
                {displayUser?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#0A0A0A] uppercase">{displayUser?.name}</h2>
                <div className="flex items-center gap-2 text-[#0A0A0A]/60 mt-1 font-bold">
                  <Mail className="w-4 h-4 text-[#F5C842]" />
                  <span>{displayUser?.email}</span>
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <ProfileItem 
                icon={<UserIcon className="w-4 h-4 text-[#F5C842]" />}
                label="Display Name" 
                value={displayUser?.name} 
              />
              <ProfileItem 
                icon={<Mail className="w-4 h-4 text-[#F5C842]" />}
                label="Email Address" 
                value={displayUser?.email} 
              />
              <ProfileItem 
                icon={<Shield className="w-4 h-4 text-[#F5C842]" />}
                label="Access Level" 
                value={isAdmin ? 'Administrator' : 'Standard User'} 
              />
              <ProfileItem 
                icon={<Calendar className="w-4 h-4 text-[#F5C842]" />}
                label="Member Since" 
                value={displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'N/A'} 
              />
            </dl>
          </div>

          <div className="bg-rose-50 border-4 border-rose-500 rounded-3xl p-8">
            <h3 className="text-rose-600 font-black mb-2 uppercase text-xs tracking-widest">Danger Zone</h3>
            <p className="text-rose-900/60 font-bold text-sm mb-6">Once you sign out, you will need to re-authenticate to access your boards and habits.</p>
            <button
               onClick={logout}
               className="bg-rose-500 hover:bg-rose-600 text-white font-black py-3 px-8 rounded-xl transition-all shadow-md active:scale-95 uppercase text-xs"
            >
              Sign Out Account
            </button>
          </div>
        </div>

        {/* Quick Links / Stats */}
        <div className="space-y-6">
          <div className="bg-white border-4 border-[#0A0A0A] rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
            <h3 className="text-[#0A0A0A] font-black uppercase mb-4">Quick Stats</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-[#0A0A0A]/5 p-3 rounded-2xl">
                  <span className="text-[#0A0A0A]/60 text-sm font-bold">Status</span>
                  <span className="text-emerald-600 text-sm font-black flex items-center gap-1.5 uppercase">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
               </div>
               <div className="flex justify-between items-center bg-[#0A0A0A]/5 p-3 rounded-2xl">
                  <span className="text-[#0A0A0A]/60 text-sm font-bold">Account Type</span>
                  <span className="text-[#0A0A0A] text-sm font-black uppercase">{isAdmin ? 'Pro' : 'Free'}</span>
               </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-[#F5C842] border-4 border-[#0A0A0A] text-[#0A0A0A] p-4 rounded-3xl font-black flex items-center justify-between group hover:bg-[#F5C842]/80 transition-all uppercase shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]"
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
    <dt className="text-xs font-bold text-[#0A0A0A]/40 uppercase tracking-widest mb-2 flex items-center gap-2">
      {icon}
      {label}
    </dt>
    <dd className="text-xl font-black text-[#0A0A0A] uppercase tracking-tighter">{value || 'Not provided'}</dd>
  </div>
);

export default ProfilePage;