import React from 'react';

const ScoreMeter = ({ score = 50, label = 'Average' }) => {
  // Determine gradient marker position
  const percent = Math.min(100, Math.max(0, score));

  // Determine indicator styles based on classification label
  let labelColor = 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
  if (label === 'Excellent') {
    labelColor = 'text-finGreen border-finGreen/30 bg-finGreen/10';
  } else if (label === 'Good') {
    labelColor = 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
  } else if (label === 'Poor') {
    labelColor = 'text-orange-500 border-orange-500/30 bg-orange-500/10';
  } else if (label === 'Critical') {
    labelColor = 'text-red-500 border-red-500/30 bg-red-500/10';
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-4xl font-extrabold text-finText tracking-tight neon-text-glow">
            {score}
          </span>
          <span className="text-sm font-semibold text-finMuted ml-1">/100</span>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-bold ${labelColor}`}>
          {label}
        </div>
      </div>

      {/* Meter track */}
      <div className="relative h-3 w-full rounded-full bg-finBorder overflow-visible mt-2">
        {/* Colors sections */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-emerald-400 to-finGreen opacity-80" />
        
        {/* Pin indicator */}
        <div 
          className="absolute -top-1 h-5 w-5 rounded-full bg-white border-4 border-finBackground shadow-md transition-all duration-1000 ease-out flex items-center justify-center translate-x-[-50%]"
          style={{ left: `${percent}%` }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-finGreen animate-ping" />
        </div>
      </div>

      {/* Meter Labels */}
      <div className="flex justify-between text-[10px] font-bold text-finMuted px-1">
        <span>CRITICAL</span>
        <span>POOR</span>
        <span>AVERAGE</span>
        <span>GOOD</span>
        <span>EXCELLENT</span>
      </div>
    </div>
  );
};

export default ScoreMeter;
