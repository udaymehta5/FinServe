import React from 'react';

const ProgressRing = ({ radius = 60, stroke = 10, progress = 0 }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  // Determine color based on progress (score)
  let strokeColor = '#00FF88'; // Neon green for >= 80
  if (progress < 40) {
    strokeColor = '#EF4444'; // Red
  } else if (progress < 60) {
    strokeColor = '#F59E0B'; // Orange
  } else if (progress < 80) {
    strokeColor = '#10B981'; // Greenish
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg] transition-transform duration-500"
      >
        {/* Background circle */}
        <circle
          stroke="#1B1B1B"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Foreground circle with animation */}
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      {/* Percentage Center Text */}
      <div className="absolute text-center">
        <span className="text-2xl font-bold text-finText">{progress}</span>
        <span className="text-xs font-medium text-finMuted block">Score</span>
      </div>
    </div>
  );
};

export default ProgressRing;
