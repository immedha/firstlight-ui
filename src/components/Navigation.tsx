import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Grid3x3, Upload, FolderOpen, LogIn, LogOut, Trophy } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { signInAction, logOutAction } from '@/store/user/userActions';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { KARMA_CONFIG } from '@/lib/karmaConfig';

const Navigation = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.user.userId);
  const displayName = useAppSelector(state => state.user.displayName);
  const karmaPoints = useAppSelector(state => state.user.karmaPoints);
  const userTier = karmaPoints >= KARMA_CONFIG.TIER_1_THRESHOLD ? 1 : (karmaPoints >= KARMA_CONFIG.TIER_2_THRESHOLD ? 2 : 3);

  // Base nav items that everyone sees
  const baseNavItems = [
    { path: '/products', label: 'Browse Products', icon: Grid3x3 },
  ];

  // Auth-only nav items
  const authNavItems = userId ? [
    { path: '/add-product', label: 'Add Product', icon: Upload },
    { path: '/my-products', label: 'My Products', icon: FolderOpen },
  ] : [];

  const navItems = [...baseNavItems, ...authNavItems];

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
              <HoverCard openDelay={0} closeDelay={0}>
                <HoverCardTrigger asChild>
                  <button className="flex items-center gap-2 ml-2 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                    <span className="text-sm font-medium hidden md:inline">{displayName}</span>
                    <Trophy className={`w-4 h-4 ${
                      userTier === 1 ? 'text-yellow-500' : userTier === 2 ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64 p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Karma Points</p>
                    <div className="flex items-center gap-2">
                      <Trophy className={`w-5 h-5 ${
                        userTier === 1 ? 'text-yellow-500' : userTier === 2 ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                      <span className="text-2xl font-bold">{karmaPoints}</span>
                      <span className="text-xs text-muted-foreground">
                        ({KARMA_CONFIG.getTierName(userTier)})
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleSignOut}
                      className="w-full justify-start"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>
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
