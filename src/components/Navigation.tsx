import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Grid3x3, Upload, FolderOpen, LogIn, LogOut, Trophy } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { signInAction, logOutAction } from '@/store/user/userActions';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { KARMA_CONFIG } from '@/lib/karmaConfig';
import { Logo } from '@/components/Logo';

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
      className="sticky top-0 z-50 glass-effect border-b backdrop-blur-xl"
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="group">
            <Logo showText={true} size="sm" />
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-2 sm:px-3 py-1.5 rounded-md transition-all hover:scale-105"
                >
                  <div className={`flex items-center gap-1.5 ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-medium">{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
            
            {userId ? (
              <HoverCard openDelay={0} closeDelay={0}>
                <HoverCardTrigger asChild>
                  <Link
                    to="/analytics"
                    className="flex items-center gap-1.5 ml-1 px-2 sm:px-3 py-1.5 rounded-md hover:bg-secondary/50 transition-all hover:scale-105 cursor-pointer"
                  >
                    <span className="text-xs font-medium hidden sm:inline">{displayName}</span>
                    <Trophy className={`w-4 h-4 ${
                      userTier === 1 ? 'text-yellow-500' : userTier === 2 ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                  </Link>
                </HoverCardTrigger>
                <HoverCardContent className="w-56 p-3 space-y-2">
                  <div>
                    <p className="text-xs font-medium mb-1">Karma Points</p>
                    <div className="flex items-center gap-2">
                      <Trophy className={`w-4 h-4 ${
                        userTier === 1 ? 'text-yellow-500' : userTier === 2 ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                      <span className="text-xl font-bold">{karmaPoints}</span>
                      <span className="text-xs text-muted-foreground">
                        ({KARMA_CONFIG.getTierName(userTier)})
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t space-y-2">
                    <Link to="/analytics">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start h-8 text-xs"
                      >
                        View Analytics
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleSignOut}
                      className="w-full justify-start h-8 text-xs"
                    >
                      <LogOut className="w-3 h-3 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <Button variant="default" size="sm" onClick={handleSignIn} className="ml-1 h-8 text-xs px-2 sm:px-3">
                <LogIn className="w-3 h-3" />
                <span className="hidden sm:inline ml-1.5">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
