import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import type { User } from '../lib/apiClient';

export const ProfilePage: React.FC = () => {
  const { user: authUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        if (isMounted) setProfile(data);
      } catch (err) {
        if (isMounted) setError('Failed to synchronize profile data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-400 font-medium animate-pulse">Loading your workspace...</p>
      </div>
    );
  }

  const displayUser = profile || authUser;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-blue-500/30">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">G</div>
            <span className="font-bold tracking-tight text-white">GeminiApp</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-red-500/10 hover:text-red-400 px-4 py-2 rounded-lg border border-slate-700 hover:border-red-500/20"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-6">
        {/* Profile Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Account Settings</h1>
            <p className="text-slate-400 mt-2">Manage your public profile and account preferences.</p>
          </div>
          {isAdmin && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
              Admin Access
            </span>
          )}
        </div>

        {/* Content Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="p-8 border-b border-slate-800 flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-500/20">
              {displayUser?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{displayUser?.name}</h2>
              <p className="text-slate-400">{displayUser?.email}</p>
            </div>
          </div>

          <div className="p-8">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <ProfileItem label="Full Legal Name" value={displayUser?.name} />
              <ProfileItem label="Contact Email" value={displayUser?.email} />
              <ProfileItem 
                label="Account Status" 
                value={isAdmin ? 'Active (Administrative)' : 'Active (Standard)'} 
              />
              <ProfileItem 
                label="Joined Date" 
                value={displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'} 
              />
            </dl>
          </div>

          <div className="bg-slate-800/30 p-6 border-t border-slate-800 flex justify-end">
            <button className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
              Request Data Export
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-component for clean mapping
const ProfileItem = ({ label, value }: { label: string; value?: string }) => (
  <div className="sm:col-span-1">
    <dt className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</dt>
    <dd className="text-base font-medium text-slate-200">{value || 'Not provided'}</dd>
  </div>
);

export default ProfilePage;