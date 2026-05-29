import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-pastel-bg flex font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-16 lg:pl-64 transition-all duration-300 min-h-screen">
        <Header />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
