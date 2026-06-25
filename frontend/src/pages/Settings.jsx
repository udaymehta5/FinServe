import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, ShieldAlert, BadgeDollarSign, Lock } from 'lucide-react';

const Settings = () => {
  const { user, updateProfile, showToast } = useAuth();

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [monthlyIncome, setMonthlyIncome] = useState(user?.monthlyIncome || '');
  const [financialGoal, setFinancialGoal] = useState(user?.financialGoal || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are required fields', 'error');
      return;
    }

    setUpdatingProfile(true);
    const result = await updateProfile({
      name,
      email,
      monthlyIncome: monthlyIncome ? Number(monthlyIncome) : 0,
      financialGoal: financialGoal ? Number(financialGoal) : 0
    });
    setUpdatingProfile(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password) return;

    if (password.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setUpdatingPassword(true);
    const result = await updateProfile({ password });
    setUpdatingPassword(false);

    if (result && result.success) {
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-finText">Account Settings</h1>
        <p className="text-xs text-finMuted mt-1">Configure your personal profile details, default financial limits, and secure your credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Settings Panel */}
        <div className="glass-panel p-6 rounded-xl border border-finBorder/60 space-y-4">
          <div className="flex items-center gap-2 border-b border-finBorder pb-2">
            <BadgeDollarSign className="h-5 w-5 text-finGreen" />
            <span className="text-xs font-bold text-finText uppercase tracking-wider">Financial Profile</span>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1.5">
                Stated Monthly Income (INR)
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen"
              />
              <p className="text-[9px] text-finMuted mt-1">Used by AI CFO to measure your savings rate and burn rate velocity.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1.5">
                Target Savings Goal budget (INR)
              </label>
              <input
                type="number"
                value={financialGoal}
                onChange={(e) => setFinancialGoal(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen"
              />
              <p className="text-[9px] text-finMuted mt-1">Used to plot savings trajectories and calculate timeline success probabilities.</p>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="px-4 py-2.5 rounded-lg bg-finGreen hover:bg-finGreenHover text-black font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
            >
              {updatingProfile ? 'Saving Details...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Password Management Settings Panel */}
        <div className="glass-panel p-6 rounded-xl border border-finBorder/60 space-y-4">
          <div className="flex items-center gap-2 border-b border-finBorder pb-2">
            <Lock className="h-5 w-5 text-finGreen" />
            <span className="text-xs font-bold text-finText uppercase tracking-wider">Change Password</span>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-finMuted uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-finBackground border border-finBorder rounded-lg text-xs text-finText focus:outline-none focus:border-finGreen"
              />
            </div>

            <div className="text-[9.5px] text-finMuted leading-relaxed flex gap-2 bg-finCard border border-finBorder p-3 rounded">
              <ShieldAlert className="h-4 w-4 text-orange-400 shrink-0" />
              <span>For security reasons, changing your password will automatically schedule auto-logout tasks to invalidate active JWT tokens on your other devices.</span>
            </div>

            <button
              type="submit"
              disabled={updatingPassword || !password}
              className="px-4 py-2.5 rounded-lg bg-finGreen hover:bg-finGreenHover text-black font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
            >
              {updatingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;
