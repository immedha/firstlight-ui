import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MessageSquare } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { KARMA_CONFIG } from '@/lib/karmaConfig';

const ProductsPage = () => {
  const allProjects = useAppSelector(state => state.projects.allProjects);
  const userId = useAppSelector(state => state.user.userId);
  const userKarma = useAppSelector(state => state.user.karmaPoints);
  
  // Memoize filtered products to prevent infinite loop
  const products = useMemo(
    () => allProjects.filter(p => p.status === 'published'),
    [allProjects]
  );
  
  const [sortedProducts, setSortedProducts] = useState<typeof products>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sortProductsByTier = async () => {
      if (!userId) {
        // Not logged in - show all products as-is
        setSortedProducts(products);
        setLoading(false);
        return;
      }

      // User is logged in - sort by tier (same tier first)
      const userTier = KARMA_CONFIG.getTier(userKarma);
      
      // Fetch founder tiers for all products
      const productsWithTier = await Promise.all(
        products.map(async (product) => {
          try {
            const founderRef = doc(db, 'users', product.founderId);
            const founderDoc = await getDoc(founderRef);
            
            let founderTier = 3; // Default to tier 3 if fetch fails
            if (founderDoc.exists()) {
              const founderKarma = founderDoc.data().karmaPoints || 0;
              founderTier = KARMA_CONFIG.getTier(founderKarma);
            }
            
            return {
              product,
              tier: founderTier,
              isSameTier: founderTier === userTier
            };
          } catch (error) {
            console.error('Error checking founder tier:', error);
            return {
              product,
              tier: 3,
              isSameTier: false
            };
          }
        })
      );

      // Sort: same tier first, then others
      const sorted = productsWithTier
        .sort((a, b) => {
          if (a.isSameTier === b.isSameTier) {
            return 0; // Maintain original order within same tier
          }
          return a.isSameTier ? -1 : 1; // Same tier goes first
        })
        .map(item => item.product);

      setSortedProducts(sorted);
      setLoading(false);
    };

    sortProductsByTier();
  }, [products, userId, userKarma]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (sortedProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">No Products Yet</h2>
          <p className="text-muted-foreground mb-8">
            Be the first to share your product and start the feedback exchange!
          </p>
          <Link to="/add-product">
            <Button size="lg" className="gradient-primary text-white">
              Add Your Product
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Browse Products</h1>
        <p className="text-muted-foreground text-lg">
          Explore products from fellow founders and provide valuable feedback
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={`/product/${product.id}`}>
              <Card className="overflow-hidden hover-lift cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                  {(() => {
                    // Use primary image from images array if available, otherwise use imageUrl
                    const displayImageUrl = 
                      product.images?.find(img => img.isPrimary)?.url || 
                      product.images?.[0]?.url || 
                      product.imageUrl;
                    
                    return displayImageUrl ? (
                      <img
                        src={displayImageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary/30">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                    );
                  })()}
                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {product.reviewsReceived.length}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-end text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      View Details
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
