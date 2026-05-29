import React from 'react';

const ConfidenceMeter = ({ score }) => {
  // Determine color based on score
  const isHigh = score >= 70;
  const isMid = score >= 40 && score < 70;
  
  const colorClass = isHigh ? 'text-emerald-500' : isMid ? 'text-amber-500' : 'text-rose-500';
  const glowClass = isHigh ? 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 
                   isMid ? 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 
                   'shadow-[0_0_20px_rgba(244,63,94,0.3)]';
  const strokeColor = isHigh ? '#10b981' : isMid ? '#f59e0b' : '#f43f5e';

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-32 h-32 transform -rotate-180">
        <defs>
          <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#de6c7d" />
            <stop offset="100%" stopColor="#add1e6" />
          </linearGradient>
        </defs>
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="#f6f0ef"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={`${circumference / 2} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="url(#score-gradient)"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={`${circumference / 2} ${circumference}`}
          strokeDashoffset={((100 - score) / 100) * (circumference / 2)}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center mb-6`}>
        <span className="text-3xl font-bold text-pastel-text-pink">{score}</span>
      </div>
    </div>
  );
};

export default ConfidenceMeter;
