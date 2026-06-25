import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CreditCard, 
  TrendingUp, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  LogOut,
  User as UserIcon
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Expenses', to: '/expenses', icon: CreditCard },
    { name: 'Income', to: '/income', icon: TrendingUp },
    { name: 'Analytics', to: '/analytics', icon: BarChart3 },
    { name: 'AI CFO Chat', to: '/chat', icon: MessageSquare },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-finCard border-r border-finBorder flex flex-col justify-between z-30">
      {/* Brand Header */}
      <div>
        <div className="h-20 flex items-center px-6 border-b border-finBorder">
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-finGreen flex items-center justify-center font-black text-black">
              FS
            </div>
            <span className="text-xl font-extrabold tracking-wider text-finText uppercase">
              Fin<span className="text-finGreen">Serve</span>
            </span>
          </NavLink>
        </div>

        {/* Links Navigation */}
        <nav className="mt-6 px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive 
                      ? 'bg-finGreen/10 text-finGreen border-l-2 border-finGreen rounded-l-none'
                      : 'text-finMuted hover:text-finText hover:bg-finBorder/30'
                  }`
                }
              >
                <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Details & Logout */}
      <div className="p-4 border-t border-finBorder">
        {user && (
          <div className="flex items-center gap-3 px-2 py-3 mb-4 rounded-lg bg-finBackground/40">
            <div className="h-9 w-9 rounded-full bg-finBorder flex items-center justify-center text-finGreen font-bold border border-finGreen/25">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-finText truncate">{user.name}</p>
              <p className="text-[10px] text-finMuted truncate">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
