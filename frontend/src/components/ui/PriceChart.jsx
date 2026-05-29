import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl">
        <p className="text-slate-500 text-sm mb-1">{label}</p>
        <p className="text-slate-800 font-bold">
          Price: ₹{payload[0]?.value}
        </p>
        {payload[1]?.value && (
          <p className="text-slate-500 text-xs mt-1">
            30d SMA: ₹{payload[1].value}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const PriceChart = ({ data }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            stroke="#64748b" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#64748b" 
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#579dc3" 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, fill: '#579dc3', stroke: '#ffffff', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="sma_30" 
            stroke="#add1e6" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false}
            opacity={1}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
