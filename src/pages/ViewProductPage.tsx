import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { submitReviewAction } from '@/store/reviews/reviewsActions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ExternalLink, ArrowLeft, Send, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { FilledReviewSchema, ReviewGiven } from '@/types';
import { toast } from 'sonner';

const ViewProductPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  
  const product = useAppSelector(state => 
    state.projects.allProjects.find(p => p.id === projectId)
  );

  const userId = useAppSelector(state => state.user.userId);
  const allReviews = useAppSelector(state => state.reviews.allReviews);

  const existingReviews = useMemo(() => 
    allReviews.filter(r => r.projectId === projectId),
    [allReviews, projectId]
  );

  const [answers, setAnswers] = useState<{ [key: number]: string | string[] }>({});
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState<ReviewGiven | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const availableImages = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images;
    }
    if (product?.imageUrl) {
      return [{ url: product.imageUrl, isPrimary: true }];
    }
    return [];
  }, [product]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?.id, product?.images]);

  const handleNextImage = () => {
    if (availableImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % availableImages.length);
    }
  };

  const handlePrevImage = () => {
    if (availableImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + availableImages.length) % availableImages.length);
    }
  };

  useEffect(() => {
    if (userId) {
      const review = existingReviews.find(r => r.reviewerId === userId);
      if (review) {
        setUserHasReviewed(true);
        setUserReview(review);
        const filledAnswers: { [key: number]: string | string[] } = {};
        review.filledReviewSchema.forEach((schema, index) => {
          filledAnswers[index] = schema.answer;
        });
        setAnswers(filledAnswers);
      } else {
        setUserHasReviewed(false);
        setUserReview(null);
      }
    }
  }, [existingReviews, userId]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-8 text-center max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground text-sm mb-4">
            The product doesn't exist or has been removed.
          </p>
          <Link to="/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (product.status === 'draft') {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-8 text-center max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">Product Not Published</h2>
          <p className="text-muted-foreground text-sm mb-4">
            This product hasn't been published yet.
          </p>
          <Link to="/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleAnswerChange = (index: number, value: string | string[]) => {
    setAnswers({ ...answers, [index]: value });
  };

  const handleCheckboxChange = (index: number, choice: string, checked: boolean) => {
    const current = (answers[index] as string[]) || [];
    if (checked) {
      handleAnswerChange(index, [...current, choice]);
    } else {
      handleAnswerChange(index, current.filter(c => c !== choice));
    }
  };

  const allQuestionsAnswered = () => {
    return product.reviewSchema.every((_, index) => {
      const answer = answers[index];
      if (!answer) return false;
      if (Array.isArray(answer)) return answer.length > 0;
      return answer.trim() !== '';
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('Sign in to submit a review');
      return;
    }

    if (!allQuestionsAnswered()) {
      toast.error('Please answer all questions');
      return;
    }

    const filledSchema: FilledReviewSchema[] = product.reviewSchema.map((schema, index) => ({
      ...schema,
      answer: answers[index]
    }));

    dispatch(submitReviewAction({
      projectId: product.id,
      filledReviewSchema: filledSchema
    }));
    
    toast.success('Review submitted!');
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl">
      <Link to="/products">
        <Button variant="ghost" size="sm" className="mb-4 h-8 text-xs">
          <ArrowLeft className="w-3 h-3 mr-2" />
          Back
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        {/* Product Info */}
        <Card className="overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative">
            {availableImages.length > 0 ? (
              <div className="relative w-full h-full">
                <img
                  src={availableImages[currentImageIndex].url}
                  alt={product.name}
                  className="w-full h-full"
                />
                
                {availableImages.length > 1 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {availableImages.map((_, index) => (
                        <button
                          key={index}
                          className={`h-1.5 rounded-full transition-all ${
                            index === currentImageIndex
                              ? 'bg-white w-6'
                              : 'bg-white/50 w-1.5'
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl font-bold text-primary/30">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h1 className="text-xl font-bold mb-1.5">{product.name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">{product.description}</p>
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs"
            >
              Visit Website
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </Card>

        {/* Review Form */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold">
              {userHasReviewed ? 'Your Review' : 'Leave Feedback'}
            </h2>
            {userHasReviewed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          </div>
          
          {product.feedbackObjective && (
            <div className="mb-4 p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-xs font-semibold text-primary mb-1">Feedback Objective</p>
              <p className="text-sm text-muted-foreground">{product.feedbackObjective}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {product.reviewSchema.map((schema, index) => {
              const userAnswer = userReview 
                ? userReview.filledReviewSchema.find(s => s.question === schema.question)?.answer
                : answers[index];
              
              return (
              <div key={index} className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium">
                  {index + 1}. {schema.question} *
                </Label>

                {schema.type === 'short-answer' && (
                  <Textarea
                    value={(userAnswer as string) || ''}
                    onChange={(e) => !userHasReviewed && handleAnswerChange(index, e.target.value)}
                    placeholder="Type your answer..."
                    rows={3}
                    disabled={userHasReviewed}
                    className={`text-sm ${userHasReviewed ? 'bg-secondary/30' : ''}`}
                  />
                )}

                {schema.type === 'single-choice' && (
                  <RadioGroup
                    value={(userAnswer as string) || ''}
                    onValueChange={(value) => !userHasReviewed && handleAnswerChange(index, value)}
                    disabled={userHasReviewed}
                  >
                    {schema.choices?.map((choice, cIndex) => (
                      <div key={cIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={choice} id={`q${index}-c${cIndex}`} disabled={userHasReviewed} className="h-3.5 w-3.5" />
                        <Label htmlFor={`q${index}-c${cIndex}`} className={`text-xs font-normal ${userHasReviewed ? '' : 'cursor-pointer'}`}>
                          {choice}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {schema.type === 'multiple-choice' && (
                  <div className="space-y-2">
                    {schema.choices?.map((choice, cIndex) => (
                      <div key={cIndex} className="flex items-center space-x-2">
                        <Checkbox
                          id={`q${index}-c${cIndex}`}
                          checked={Array.isArray(userAnswer) ? userAnswer.includes(choice) : false}
                          onCheckedChange={(checked) => 
                            !userHasReviewed && handleCheckboxChange(index, choice, checked as boolean)
                          }
                          disabled={userHasReviewed}
                          className="h-3.5 w-3.5"
                        />
                        <Label htmlFor={`q${index}-c${cIndex}`} className={`text-xs font-normal ${userHasReviewed ? '' : 'cursor-pointer'}`}>
                          {choice}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              );
            })}

            {!userHasReviewed && (
              <Button
                type="submit"
                size="lg"
                className="w-full gradient-primary text-white h-10 text-sm"
                disabled={!allQuestionsAnswered()}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Review
              </Button>
            )}
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ViewProductPage;
