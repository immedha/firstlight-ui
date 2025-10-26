import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Sparkles, Target, MessageCircle, Zap } from 'lucide-react';
import { InteractiveBackground } from '@/components/InteractiveBackground';

const LandingPage = () => {
  const features = [
    {
      icon: Users,
      title: 'Peer Feedback',
      description: 'Connect with founders and exchange valuable insights'
    },
    {
      icon: MessageCircle,
      title: 'Custom Questions',
      description: 'Design review schemas for exact feedback needs'
    },
    {
      icon: Target,
      title: 'Quality Ratings',
      description: 'Rate reviews to gamify and maintain standards'
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Interactive Animated Background */}
      <InteractiveBackground />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-4 text-xs sm:text-sm"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">Feedback Exchange for Founders</span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Get your first users
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              And find product-market fit
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Where early products meet early users — and everyone wins through shared feedback and growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/products" className="w-full sm:w-auto">
                <Button size="lg" className="gradient-primary text-white group w-full sm:w-auto h-10 text-sm">
                  Start Getting Feedback
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/add-product" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-10 text-sm">
                  Add Your Product
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 relative">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Why First User?</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              A simple platform built for founders to help each other succeed
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="card-elevated p-4 sm:p-5 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" style={{ boxShadow: 'var(--shadow-glow)' }}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1.5">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 relative">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="card-elevated p-8 sm:p-10 text-center max-w-2xl mx-auto relative overflow-hidden"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent animate-shimmer" 
                   style={{ 
                     backgroundSize: '200% 200%',
                     filter: 'blur(60px)'
                   }} 
              />
            </div>
            
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Zap className="w-10 h-10 mx-auto mb-4 text-primary" style={{ filter: 'drop-shadow(0 0 20px hsl(var(--primary) / 0.6))' }} />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Ready to improve your product?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-6">
                Join the community of founders helping each other build better products
              </p>
              <Link to="/products">
                <Button size="lg" className="gradient-primary text-white h-10 text-sm group">
                  Browse Products
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
