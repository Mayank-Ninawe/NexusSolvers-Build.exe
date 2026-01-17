export default function Logo({ className = "", size = "default", showTagline = false }) {
  const sizes = {
    small: { icon: 24, text: 20, tagline: 10 },
    default: { icon: 40, text: 32, tagline: 14 },
    large: { icon: 80, text: 64, tagline: 18 }
  };

  const current = sizes[size] || sizes.default;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Balance Scale Icon */}
      <svg 
        width={current.icon} 
        height={current.icon} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="scaleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
        </defs>
        
        {/* Top Circle */}
        <circle cx="50" cy="15" r="6" fill="url(#scaleGradient)" />
        
        {/* Top Bar */}
        <rect x="15" y="25" width="70" height="6" rx="3" fill="url(#scaleGradient)" />
        
        {/* Center Pole */}
        <rect x="47" y="31" width="6" height="45" rx="2" fill="url(#scaleGradient)" />
        
        {/* Left Scale Lines */}
        <path d="M28 31 L20 50" stroke="url(#scaleGradient)" strokeWidth="3" strokeLinecap="round" />
        <path d="M28 31 L36 50" stroke="url(#scaleGradient)" strokeWidth="3" strokeLinecap="round" />
        
        {/* Right Scale Lines */}
        <path d="M72 31 L64 50" stroke="url(#scaleGradient)" strokeWidth="3" strokeLinecap="round" />
        <path d="M72 31 L80 50" stroke="url(#scaleGradient)" strokeWidth="3" strokeLinecap="round" />
        
        {/* Left Pan (semicircle) */}
        <path d="M15 50 Q20 60 28 60 Q28 50 28 50 L15 50 Z" fill="url(#scaleGradient)" />
        
        {/* Right Pan (semicircle) */}
        <path d="M72 50 Q72 60 80 60 Q85 50 85 50 L72 50 Z" fill="url(#scaleGradient)" />
        
        {/* Base */}
        <path d="M35 76 L50 76 L50 80 L65 80 Q70 80 70 85 Q70 90 65 90 L35 90 Q30 90 30 85 Q30 80 35 80 L50 80 L50 76" fill="url(#scaleGradient)" />
      </svg>

      {/* Text */}
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span 
            className="font-black tracking-tight text-blue-600"
            style={{ fontSize: current.text }}
          >
            Level
          </span>
          <span 
            className="font-black tracking-tight text-purple-600"
            style={{ fontSize: current.text }}
          >
            Field
          </span>
        </div>
        
        {showTagline && (
          <span 
            className="text-gray-600 font-medium -mt-1"
            style={{ fontSize: current.tagline }}
          >
            AI for Fair Placements
          </span>
        )}
      </div>
    </div>
  );
}
