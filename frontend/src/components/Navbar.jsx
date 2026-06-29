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
  User as UserIcon,
  Home,
  Info
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Home', to: '/', icon: Home },
    { name: 'Expenses', to: '/expenses', icon: CreditCard },
    { name: 'Income', to: '/income', icon: TrendingUp },
    { name: 'Analytics', to: '/analytics', icon: BarChart3 },
    { name: 'AI CFO Chat', to: '/chat', icon: MessageSquare },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 h-16 md:h-screen fixed left-0 bottom-0 md:top-0 md:bottom-auto bg-finCard border-t md:border-t-0 md:border-r border-finBorder flex flex-row md:flex-col justify-between z-50">
      
      {/* Desktop Brand Header (Hidden on Mobile) */}
      <div className="hidden md:block">
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
      </div>

      {/* Links Navigation (Row on Mobile, Col on Desktop) */}
      <nav className="flex-1 md:flex-none flex flex-row md:flex-col items-center justify-around md:justify-start md:mt-6 px-2 md:px-4 md:space-y-1 h-full md:h-auto overflow-x-auto md:overflow-visible">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-lg text-[10px] md:text-sm font-medium transition-all duration-200 group flex-shrink-0 min-w-[64px] md:min-w-0 ${
                  isActive 
                    ? 'bg-finGreen/10 text-finGreen md:border-l-2 md:border-finGreen md:rounded-l-none'
                    : 'text-finMuted hover:text-finText md:hover:bg-finBorder/30'
                }`
              }
            >
              <Icon className="h-5 w-5 md:h-5 md:w-5 transition-transform duration-200 group-hover:scale-110" />
              <span className="md:inline">{item.name}</span>
            </NavLink>
          );
        })}

        {/* Mobile Sign Out Button (Icon Only) */}
        <button
          onClick={logout}
          className="md:hidden flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-[10px] font-medium text-red-400 hover:text-red-300 transition-all duration-200 flex-shrink-0 min-w-[64px]"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </nav>

      {/* Desktop User Details & Logout (Hidden on Mobile) */}
      <div className="hidden md:block p-4 border-t border-finBorder">
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
