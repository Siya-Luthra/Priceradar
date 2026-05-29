import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, LineChart, Bell, Settings, Radar } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Watchlist', path: '#', icon: <Bookmark className="w-5 h-5" /> },
    { name: 'Analytics', path: '#', icon: <LineChart className="w-5 h-5" /> },
    { name: 'Alerts', path: '#', icon: <Bell className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-16 lg:w-64 h-screen fixed left-0 top-0 border-r border-slate-200 bg-pastel-sidebar flex flex-col justify-between py-6 transition-all duration-300 z-20">
      <div className="flex flex-col items-center lg:items-start w-full lg:px-4 space-y-8">
        
        {/* Logo */}
        <div className="flex items-center justify-center lg:justify-start w-full px-2 lg:px-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-pastel-badge-bg shadow-md">
            <Radar className="w-6 h-6 text-pastel-price-blue" />
          </div>
          <span className="hidden lg:block ml-3 font-bold text-xl text-slate-800 tracking-tight">PriceRadar</span>
        </div>
        
        {/* Nav Links */}
        <nav className="flex flex-col space-y-2 w-full px-2 lg:px-2">
          {navItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-pastel-badge-bg text-pastel-text-pink' 
                    : 'text-slate-700 hover:bg-pastel-bg hover:text-slate-900'
                }`}
                title={item.name}
              >
                <div className="flex items-center justify-center w-6 h-6">
                  {item.icon}
                </div>
                <span className="hidden lg:block ml-3 font-medium text-sm">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Settings */}
      <div className="flex flex-col items-center lg:items-start w-full px-2 lg:px-4">
        <Link 
          to="#"
          className="flex items-center p-3 w-full rounded-lg text-slate-700 hover:bg-pastel-soft-pink hover:text-slate-900 transition-all duration-200"
          title="Settings"
        >
          <div className="flex items-center justify-center w-6 h-6">
            <Settings className="w-5 h-5" />
          </div>
          <span className="hidden lg:block ml-3 font-medium text-sm">Settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
