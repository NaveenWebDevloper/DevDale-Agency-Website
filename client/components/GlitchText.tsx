import React, { CSSProperties } from 'react';
import './GlitchText.css';

interface GlitchTextProps {
  children: string;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({
  children,
  speed = 1,
  enableShadows = true,
  enableOnHover = true,
  className = ''
}) => {
  const inlineStyles = {
    '--after-duration': `${speed * 3}s`,
    '--before-duration': `${speed * 2}s`,
    '--after-shadow': enableShadows ? '-5px 0 rgba(236, 72, 153, 0.4)' : 'none', // soft neon pink shadow
    '--before-shadow': enableShadows ? '5px 0 rgba(59, 130, 246, 0.4)' : 'none'  // soft neon blue shadow
  } as CSSProperties;

  const hoverClass = enableOnHover ? 'enable-on-hover' : '';

  return (
    <div 
      className={`glitch ${hoverClass} ${className}`} 
      style={inlineStyles} 
      data-text={children}
    >
      {children}
    </div>
  );
};

export default GlitchText;
