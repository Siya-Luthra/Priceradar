import React from 'react';

const Header = () => {
  return (
    <header className="h-16 w-full border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Search Stub */}
      <div className="w-32 lg:w-64 h-9 rounded-full bg-pastel-table-header border-none flex items-center px-4">
        <div className="text-slate-500 text-sm">Search</div>
      </div>
      
      {/* Profile Stub */}
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-slate-200" />
      </div>
    </header>
  );
};

export default Header;
