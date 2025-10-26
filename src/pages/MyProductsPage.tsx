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
    toast.success('Product published!');
  };

  const handleRateReview = (rating: number) => {
    if (currentReview) {
      dispatch(updateReviewQualityAction({ reviewId: currentReview.id, reviewQuality: rating }));
      setTempRating(rating);
      toast.success('Review rated!');
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

  if (myProjects.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Products Yet</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Add your first product to start receiving feedback!
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
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Products</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            View and manage feedback for your products
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium mb-1.5">Select a Product</label>
          <Select value={selectedProductId || ''} onValueChange={setSelectedProductId}>
            <SelectTrigger className="w-full h-9 text-sm">
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
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h2 className="text-lg font-bold">{selectedProduct.name}</h2>
                    <Badge variant={selectedProduct.status === 'draft' ? 'secondary' : 'default'} className="text-xs">
                      {selectedProduct.status === 'draft' ? 'Draft' : 'Published'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{selectedProduct.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Reviews: {productReviews.length}</span>
                    {selectedProduct.status === 'published' && (
                      <a
                        href={selectedProduct.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {selectedProduct.link}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {selectedProduct.status === 'draft' ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/add-product/${selectedProduct.id}`)}
                        className="h-8 text-xs flex-1 sm:flex-initial"
                      >
                        <Edit className="w-3 h-3 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="gradient-primary text-white h-8 text-xs flex-1 sm:flex-initial"
                        onClick={() => handlePublishProduct(selectedProduct.id)}
                      >
                        <Send className="w-3 h-3 mr-1.5" />
                        Publish
                      </Button>
                    </>
                  ) : (
                    <Link to={`/product/${selectedProduct.id}`} className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="h-8 text-xs w-full">
                        <Eye className="w-3 h-3 mr-1.5" />
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>

            {selectedProduct.status === 'draft' ? (
              <Card className="p-8 text-center">
                <h3 className="text-base font-semibold mb-2">Product is a Draft</h3>
                <p className="text-muted-foreground text-xs mb-4">
                  Publish your product to start receiving reviews!
                </p>
                <Button
                  onClick={() => handlePublishProduct(selectedProduct.id)}
                  className="gradient-primary text-white h-9 text-sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Publish Now
                </Button>
              </Card>
            ) : productReviews.length === 0 ? (
              <Card className="p-8 text-center">
                <h3 className="text-base font-semibold mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground text-xs">
                  Share your product to start receiving feedback!
                </p>
              </Card>
            ) : (
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold">
                    Review {currentReviewIndex + 1} of {productReviews.length}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrev}
                      disabled={currentReviewIndex === 0}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      disabled={!canGoNext || currentReviewIndex === productReviews.length - 1}
                      className="h-7 w-7 p-0"
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
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b">
                        <div>
                          <p className="font-medium text-sm">Anonymous Reviewer</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(currentReview.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">
                            {currentReview.reviewQuality > 0 ? 'Edit Rating' : 'Rate Review'}
                          </p>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRateReview(star)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`w-5 h-5 ${
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

                      <div className="space-y-3">
                        {currentReview.filledReviewSchema.map((schema, index) => (
                          <div key={index} className="space-y-1.5">
                            <p className="font-medium text-xs">{schema.question}</p>
                            <div className="pl-3 py-2 bg-secondary/30 rounded-lg">
                              {Array.isArray(schema.answer) ? (
                                <ul className="list-disc list-inside space-y-0.5">
                                  {schema.answer.map((ans, i) => (
                                    <li key={i} className="text-muted-foreground text-xs">{ans}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted-foreground text-xs">{schema.answer}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

                {!canGoNext && currentReviewIndex < productReviews.length - 1 && (
                  <p className="text-xs text-center text-muted-foreground pt-3">
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
