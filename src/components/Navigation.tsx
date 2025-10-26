import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Grid3x3, Upload, FolderOpen, LogIn, LogOut } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { signInAction, logOutAction } from '@/store/user/userActions';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.user.userId);
  const displayName = useAppSelector(state => state.user.displayName);

  const navItems = [
    { path: '/projects', label: 'Browse Projects', icon: Grid3x3 },
    { path: '/upload-project', label: 'Upload Project', icon: Upload },
    { path: '/my-projects', label: 'My Projects', icon: FolderOpen },
  ];

  const handleSignIn = () => {
    dispatch(signInAction());
  };

  const handleSignOut = () => {
    dispatch(logOutAction());
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass-effect border-b"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="w-6 h-6 text-primary group-hover:animate-glow-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              First User
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-4 py-2 rounded-lg transition-colors"
                >
                  <div className={`flex items-center gap-2 ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline text-sm font-medium">{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
            
            {userId ? (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm text-muted-foreground hidden md:inline">{displayName}</span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline ml-2">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button variant="default" size="sm" onClick={handleSignIn} className="ml-2">
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline ml-2">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
