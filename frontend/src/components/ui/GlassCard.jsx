import React from 'react';

const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`bg-white shadow-sm border border-slate-200 rounded-xl ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
