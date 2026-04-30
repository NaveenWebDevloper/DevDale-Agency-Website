import { useRef, useEffect, useState, useMemo, useId } from 'react';
import { motion, useScroll, useTransform, useSpring, useVelocity, useMotionValue } from 'framer-motion';
import './CurvedLoop.css';

interface CurvedLoopProps {
  marqueeText?: string;
  speed?: number;
  className?: string;
  curveAmount?: number;
  direction?: 'left' | 'right';
  interactive?: boolean;
  wrapperClassName?: string;
  sparkleColor?: string;
}

const CurvedLoop = ({
  marqueeText = '',
  speed = 2,
  className,
  curveAmount = 200,
  direction = 'left',
  interactive = true,
  wrapperClassName = '',
  sparkleColor = 'currentColor',
}: CurvedLoopProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const text = useMemo(() => {
    const hasTrailing = /\s|\u00A0$/.test(marqueeText);
    return (hasTrailing ? marqueeText.replace(/\s+$/, '') : marqueeText) + '\u00A0\u00A0';
  }, [marqueeText]);

  const measureRef = useRef<SVGTextElement>(null);
  const textPathRef = useRef<SVGTextPathElement>(null);
  const [spacing, setSpacing] = useState(0);
  const [offset, setOffset] = useState(0);
  const uid = useId();
  const pathId = `curve-${uid}`;
  const shimmerGradId = `shimmer-${uid}`;
  
  // ── SCROLL REACTIVITY ──
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  
  // Deepen curve on scroll
  const dynamicCurve = useTransform(smoothVelocity, [-3000, 0, 3000], [curveAmount + 80, curveAmount, curveAmount + 80]);
  const springCurve = useSpring(dynamicCurve, { stiffness: 100, damping: 30 });
  
  // Animate letter spacing on velocity
  const letterSpacing = useTransform(smoothVelocity, [-3000, 0, 3000], ["0.1em", "0em", "0.1em"]);
  const springSpacing = useSpring(letterSpacing as any, { stiffness: 100, damping: 30 });

  // ── MOUSE INTERACTION (3D TILT) ──
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const tiltX = useTransform(mouseY, [0, 1], ["5deg", "-5deg"]);
  const tiltY = useTransform(mouseX, [0, 1], ["-5deg", "5deg"]);
  const springTiltX = useSpring(tiltX, { stiffness: 150, damping: 25 });
  const springTiltY = useSpring(tiltY, { stiffness: 150, damping: 25 });

  const dirRef = useRef<'left' | 'right'>(direction);
  const ready = spacing > 0;

  useEffect(() => {
    if (measureRef.current) setSpacing(measureRef.current.getComputedTextLength());
  }, [text, className]);

  useEffect(() => {
    if (!spacing) return;
    const initial = -spacing;
    setOffset(initial);
  }, [spacing]);

  useEffect(() => {
    if (!spacing || !ready) return;
    let frame = 0;
    const step = () => {
      if (textPathRef.current) {
        const delta = dirRef.current === 'right' ? speed : -speed;
        const currentOffset = parseFloat(textPathRef.current.getAttribute('startOffset') || '0');
        let newOffset = currentOffset + delta;
        const wrapPoint = spacing;
        if (newOffset <= -wrapPoint) newOffset += wrapPoint;
        if (newOffset > 0) newOffset -= wrapPoint;
        textPathRef.current.setAttribute('startOffset', newOffset + 'px');
        setOffset(newOffset);
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [spacing, speed, ready]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const isWhite = className?.includes('white');
  const fillBase = isWhite ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
  const fillPeak = isWhite ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.9)';

  const [pathD, setPathD] = useState(`M-100,40 Q500,${40 + curveAmount} 1540,40`);

  useEffect(() => {
    return springCurve.onChange((v) => {
      setPathD(`M-100,40 Q500,${40 + v} 1540,40`);
    });
  }, [springCurve]);

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`curved-loop-jacket ${wrapperClassName}`}
      style={{ 
        visibility: ready ? 'visible' : 'hidden', 
        position: 'relative',
        perspective: "1000px"
      }}
    >
      <motion.div
        style={{ 
          rotateX: springTiltX, 
          rotateY: springTiltY,
          transformStyle: "preserve-3d"
        }}
      >
        <svg className="curved-loop-svg" viewBox="0 0 1440 120" style={{ overflow: 'visible' }}>
          <text
            ref={measureRef}
            className={className}
            xmlSpace="preserve"
            style={{ visibility: 'hidden', opacity: 0, pointerEvents: 'none' }}
          >
            {text}
          </text>

          <defs>
            <path id={pathId} d={pathD} fill="none" stroke="transparent" />
            <linearGradient id={shimmerGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={fillBase} />
              <stop offset="50%" stopColor={fillPeak} />
              <stop offset="100%" stopColor={fillBase} />
            </linearGradient>
          </defs>

          {ready && (
            <motion.text
              fontWeight="900"
              xmlSpace="preserve"
              className={className}
              fill={`url(#${shimmerGradId})`}
              style={{ 
                textRendering: 'optimizeSpeed',
                letterSpacing: springSpacing,
                filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.1))'
              }}
            >
              <textPath
                ref={textPathRef}
                href={`#${pathId}`}
                startOffset={offset + 'px'}
                xmlSpace="preserve"
              >
                {Array(Math.ceil(2000 / spacing) + 2).fill(text).join('')}
              </textPath>
            </motion.text>
          )}
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default CurvedLoop;
