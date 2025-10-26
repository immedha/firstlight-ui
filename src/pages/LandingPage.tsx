import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Sparkles, Target, MessageCircle, Zap } from 'lucide-react';

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 relative">
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
              Get feedback from
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                fellow founders
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Share your products, receive structured feedback, and help other founders in a collaborative peer-to-peer loop
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
      <section className="py-12 sm:py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
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
                className="card-elevated p-4 sm:p-5 hover-lift group"
              >
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="card-elevated p-8 sm:p-10 text-center max-w-2xl mx-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 gradient-hero opacity-5" />
            <div className="relative">
              <Zap className="w-10 h-10 mx-auto mb-4 text-primary animate-pulse" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to improve your product?</h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-6">
                Join the community of founders helping each other build better products
              </p>
              <Link to="/products">
                <Button size="lg" className="gradient-primary text-white h-10 text-sm">
                  Browse Products
                  <ArrowRight className="ml-2 w-4 h-4" />
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
