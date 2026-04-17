import React from 'react';

interface LogoProps {
  className?: string;
}

const DéFreeLogo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center bg-transparent ${className}`}>
      <img 
        src="/assets/DeFreelogo.png" 
        alt="DeFree Logo" 
        className="h-10 w-auto shrink-0 object-contain" 
      />
    </div>
  );
};

export default DéFreeLogo;
