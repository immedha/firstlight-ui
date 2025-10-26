import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateReviewQualityAction } from '@/store/reviews/reviewsActions';
import { publishProjectAction } from '@/store/user/userActions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, ChevronLeft, ChevronRight, Star, Edit, Send, Eye } from 'lucide-react';
import { ReviewGiven } from '@/types';
import { toast } from 'sonner';

const MyProductsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const allProjects = useAppSelector(state => state.projects.allProjects);
  const allReviews = useAppSelector(state => state.reviews.allReviews);
  const userId = useAppSelector(state => state.user.userId);
  
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [tempRating, setTempRating] = useState(0);

  const myProjects = allProjects.filter(p => p.founderId === userId);
  const selectedProduct = myProjects.find(p => p.id === selectedProductId);
  
  const productReviews = selectedProduct
    ? allReviews.filter(r => r.projectId === selectedProduct.id)
    : [];

  const currentReview: ReviewGiven | null = productReviews[currentReviewIndex] || null;

  const handlePublishProduct = (productId: string) => {
    dispatch(publishProjectAction({ projectId: productId }));
    toast.success('Product published successfully!');
  };

  const handleRateReview = (rating: number) => {
    if (currentReview) {
      dispatch(updateReviewQualityAction({ reviewId: currentReview.id, reviewQuality: rating }));
      setTempRating(rating);
    }
  };

  const canGoNext = currentReview && (currentReview.reviewQuality > 0 || tempRating > 0) && currentReviewIndex < productReviews.length - 1;

  const handleNext = () => {
    if (canGoNext && currentReviewIndex < productReviews.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
      setTempRating(0);
    }
  };

  const handlePrev = () => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex(currentReviewIndex - 1);
      setTempRating(0);
    }
  };

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your uploaded products.
          </p>
          <Link to="/">
            <Button className="gradient-primary text-white">Go Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (myProjects.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">No Products Yet</h2>
          <p className="text-muted-foreground mb-8">
            Add your first product to start receiving feedback from fellow founders!
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
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">My Products</h1>
          <p className="text-muted-foreground text-lg">
            View and manage feedback for your products
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Select a Product</label>
          <Select value={selectedProductId || ''} onValueChange={setSelectedProductId}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Choose a product" />
            </SelectTrigger>
            <SelectContent>
              {myProjects.map(product => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex items-center gap-2">
                    {product.name}
                    {product.status === 'draft' && (
                      <Badge variant="secondary" className="text-xs">Draft</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProduct && (
          <div className="space-y-8">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                    <Badge variant={selectedProduct.status === 'draft' ? 'secondary' : 'default'}>
                      {selectedProduct.status === 'draft' ? 'Draft' : 'Published'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{selectedProduct.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Total Reviews: {productReviews.length}</span>
                  {selectedProduct.status === 'published' && (
                    <a
                      href={selectedProduct.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Product
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedProduct.status === 'draft' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/add-product/${selectedProduct.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="gradient-primary text-white"
                        onClick={() => handlePublishProduct(selectedProduct.id)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Publish
                      </Button>
                    </>
                  )}
                  {selectedProduct.status === 'published' && (
                    <Link to={`/product/${selectedProduct.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>

            {selectedProduct.status === 'draft' ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold mb-2">Product is a Draft</h3>
                <p className="text-muted-foreground mb-4">
                  Publish your product to start receiving reviews!
                </p>
                <Button
                  onClick={() => handlePublishProduct(selectedProduct.id)}
                  className="gradient-primary text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Publish Now
                </Button>
              </Card>
            ) : productReviews.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground">
                  Share your product to start receiving feedback!
                </p>
              </Card>
            ) : (
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">
                    Review {currentReviewIndex + 1} of {productReviews.length}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      disabled={currentReviewIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      disabled={!canGoNext || currentReviewIndex === productReviews.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {currentReview && (
                    <motion.div
                      key={currentReview.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between pb-4 border-b">
                        <div>
                          <p className="font-medium">Reviewer</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(currentReview.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-2">
                            {currentReview.reviewQuality > 0 ? 'Edit Rating' : 'Rate this review'}
                          </p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRateReview(star)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    star <= (tempRating || currentReview.reviewQuality)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {currentReview.filledReviewSchema.map((schema, index) => (
                          <div key={index} className="space-y-2">
                            <p className="font-medium">{schema.question}</p>
                            <div className="pl-4 py-3 bg-secondary/30 rounded-lg">
                              {Array.isArray(schema.answer) ? (
                                <ul className="list-disc list-inside space-y-1">
                                  {schema.answer.map((ans, i) => (
                                    <li key={i} className="text-muted-foreground">{ans}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted-foreground">{schema.answer}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

                {!canGoNext && currentReviewIndex < productReviews.length - 1 && (
                  <p className="text-sm text-center text-muted-foreground pt-4">
                    Rate this review to see the next one
                  </p>
                )}
              </Card>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MyProductsPage;
