import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'motion/react';
import { useEffect } from 'react';

export default function InteractiveBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollY } = useScroll();

  // Smooth springs for fluid movement
  const springX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      // Normalize values from -0.5 to 0.5
      mouseX.set(clientX / innerWidth - 0.5);
      mouseY.set(clientY / innerHeight - 0.5);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[var(--bg-primary)] select-none pointer-events-none transition-colors duration-500">
      {/* Base Glossy Layer */}
      <div className="absolute inset-0 bg-[var(--bg-secondary)]" />
      
      {/* Soft Magazine Tint / Silk Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)]/60 to-[var(--bg-primary)] opacity-100" />
      
      {/* Subtle Depth */}
      <div className="absolute inset-0 bg-radial-[at_50%_0%] from-gold/5 via-transparent to-transparent opacity-20 z-10" />

      {/* Luxury Silk Accents - Ultra Blurry */}
      <motion.div 
        style={{ 
          x: useTransform(springX, (val) => val * 30), 
          y: useTransform([scrollY, springY], ([scroll, my]) => (scroll as number) * -0.05 + (my as number) * 30) 
        }}
        className="absolute top-[-20%] left-[-15%] w-[80%] h-[80%] rounded-full bg-gold/5 blur-[120px] opacity-80"
      />
      
      <motion.div 
        style={{ 
          x: useTransform(springX, (val) => val * -40), 
          y: useTransform([scrollY, springY], ([scroll, my]) => (scroll as number) * -0.03 + (my as number) * -40) 
        }}
        className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-gold/3 blur-[160px] opacity-100"
      />
    </div>
  );
}
