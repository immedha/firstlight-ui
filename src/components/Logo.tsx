import { motion } from 'framer-motion';
import { Users, Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className = '', showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-sm', gap: 'gap-2' },
    md: { icon: 'w-10 h-10', text: 'text-base', gap: 'gap-2.5' },
    lg: { icon: 'w-14 h-14', text: 'text-xl', gap: 'gap-3' }
  };

  const { icon: iconSize, text: textSize, gap: gapSize } = sizeClasses[size];

  return (
    <motion.div 
      className={`flex items-center ${gapSize} ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo Icon */}
      <div className={`relative ${iconSize} shrink-0`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl" />
        <div className="relative inset-0 flex items-center justify-center p-2.5">
          <Users className="w-full h-full text-white drop-shadow-md" strokeWidth={2} />
        </div>
        
        {/* Sparkle accent for "first" concept */}
        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
          <Sparkles className="w-2 h-2 text-white" fill="white" />
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent ${textSize}`}>
          firstuser
        </span>
      )}
    </motion.div>
  );
};

export default Logo;

