import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, MessageSquare, Search } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { KARMA_CONFIG } from '@/lib/karmaConfig';

const ProductsPage = () => {
  const allProjects = useAppSelector(state => state.projects.allProjects);
  const userId = useAppSelector(state => state.user.userId);
  const userKarma = useAppSelector(state => state.user.karmaPoints);
  
  const products = useMemo(
    () => allProjects.filter(p => p.status === 'published'),
    [allProjects]
  );
  
  const [sortedProducts, setSortedProducts] = useState<typeof products>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sortProductsByTier = async () => {
      if (!userId) {
        setSortedProducts(products);
        setLoading(false);
        return;
      }

      const userTier = KARMA_CONFIG.getTier(userKarma);
      
      const productsWithTier = await Promise.all(
        products.map(async (product) => {
          try {
            const founderRef = doc(db, 'users', product.founderId);
            const founderDoc = await getDoc(founderRef);
            
            let founderTier = 3;
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

      const sorted = productsWithTier
        .sort((a, b) => {
          if (a.isSameTier === b.isSameTier) return 0;
          return a.isSameTier ? -1 : 1;
        })
        .map(item => item.product);

      setSortedProducts(sorted);
      setLoading(false);
    };

    sortProductsByTier();
  }, [products, userId, userKarma]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Loading products...</p>
        </div>
      </div>
    );
  }

  if (sortedProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Products Yet</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Be the first to share your product!
          </p>
          <Link to="/add-product">
            <Button size="lg" className="gradient-primary text-white h-10 text-sm">
              Add Your Product
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Browse Products</h1>
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Explore products from fellow founders and provide valuable feedback
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
        {sortedProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/product/${product.id}`}>
              <Card className="overflow-hidden hover-lift cursor-pointer group transition-all">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                  {(() => {
                    const displayImageUrl = 
                      product.images?.find(img => img.isPrimary)?.url || 
                      product.images?.[0]?.url || 
                      product.imageUrl;
                    
                    return displayImageUrl ? (
                      <img
                        src={displayImageUrl}
                        alt={product.name}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary/30">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                    );
                  })()}
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {product.reviewsReceived.length}
                  </div>
                </div>
                <div className="p-2.5">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-end text-xs text-muted-foreground group-hover:text-primary transition-colors">
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
