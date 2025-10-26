import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, TrendingUp, Lightbulb, Rocket, Star } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  icon: typeof Sparkles;
  duration: number;
  delay: number;
}

export const InteractiveBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles] = useState<Particle[]>(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 20,
      icon: [Sparkles, Zap, TrendingUp, Lightbulb, Rocket, Star][Math.floor(Math.random() * 6)],
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }))
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient mesh background */}
      <motion.div 
        className="absolute inset-0"
        style={{ background: 'var(--gradient-mesh)' }}
        animate={{
          backgroundPosition: [`${mousePosition.x}% ${mousePosition.y}%`, `${mousePosition.x + 10}% ${mousePosition.y + 10}%`]
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Large animated gradient orbs */}
      <motion.div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
          left: `${20 + mousePosition.x * 0.05}%`,
          top: `${10 + mousePosition.y * 0.05}%`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div 
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-25"
        style={{
          background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
          right: `${15 + mousePosition.x * 0.03}%`,
          top: `${30 + mousePosition.y * 0.04}%`,
        }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <motion.div 
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)',
          left: `${40 + mousePosition.x * 0.04}%`,
          bottom: `${15 + mousePosition.y * 0.03}%`,
        }}
        animate={{
          scale: [1, 1.4, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Floating startup-themed particles */}
      {particles.map((particle) => {
        const ParticleIcon = particle.icon;
        const parallaxX = (mousePosition.x - 50) * (particle.size / 200);
        const parallaxY = (mousePosition.y - 50) * (particle.size / 200);

        return (
          <motion.div
            key={particle.id}
            className="absolute"
            initial={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              x: [0, parallaxX, 0],
              y: [0, parallaxY, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: particle.duration / 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ParticleIcon
                size={particle.size}
                className="text-primary/10"
                strokeWidth={1.5}
              />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Gradient overlay for smooth blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background/90" />
    </div>
  );
};
