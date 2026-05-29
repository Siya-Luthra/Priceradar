import React from 'react';
import GlassCard from './GlassCard';

const MetricCard = ({ title, value, subtitle, trend }) => {
  // trend can be 'up', 'down', or 'neutral'
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  
  return (
    <GlassCard className="p-6 flex flex-col justify-between hover:bg-slate-50 transition-colors duration-300">
      <h3 className="text-sm font-medium text-slate-500 mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-slate-800 tracking-tight">{value}</div>
        {trend && (
          <div className={`flex items-center text-sm font-medium px-2 py-1 rounded-md ${
            isUp ? 'bg-rose-100 text-rose-600 border border-rose-200' : 
            isDown ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 
            'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            {isUp && <span className="mr-1">↑</span>}
            {isDown && <span className="mr-1">↓</span>}
            {subtitle}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default MetricCard;
