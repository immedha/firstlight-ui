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

const ViewProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  
  const project = useAppSelector(state => 
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

  // Get available images
  const availableImages = useMemo(() => {
    if (project?.images && project.images.length > 0) {
      return project.images;
    }
    // Fallback to imageUrl for backward compatibility
    if (project?.imageUrl) {
      return [{ url: project.imageUrl, isPrimary: true }];
    }
    return [];
  }, [project]);

  // Reset image index when project or images change
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [project?.id, project?.images]);

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
      // Check if this user already reviewed this project
      const review = existingReviews.find(r => r.reviewerId === userId);
      if (review) {
        setUserHasReviewed(true);
        setUserReview(review);
        // Pre-fill answers with the existing review
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

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/projects">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Only allow viewing published projects
  if (project.status === 'draft') {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Project Not Published</h2>
          <p className="text-muted-foreground mb-6">
            This project has not been published yet and cannot be viewed.
          </p>
          <Link to="/projects">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
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
    return project.reviewSchema.every((_, index) => {
      const answer = answers[index];
      if (!answer) return false;
      if (Array.isArray(answer)) return answer.length > 0;
      return answer.trim() !== '';
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('You must be signed in to submit a review');
      return;
    }

    if (!allQuestionsAnswered()) {
      toast.error('Please answer all questions');
      return;
    }

    const filledSchema: FilledReviewSchema[] = project.reviewSchema.map((schema, index) => ({
      ...schema,
      answer: answers[index]
    }));

    dispatch(submitReviewAction({
      projectId: project.id,
      filledReviewSchema: filledSchema
    }));
    
    toast.success('Review submitted successfully!');
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <Link to="/projects">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Project Info */}
        <Card className="overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative">
            {availableImages.length > 0 ? (
              <div className="relative w-full h-full">
                <img
                  src={availableImages[currentImageIndex].url}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation arrows - only show if more than one image */}
                {availableImages.length > 1 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>

                    {/* Image indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {availableImages.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? 'bg-white w-8'
                              : 'bg-white/50'
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
                  {project.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
            <p className="text-sm mb-3 line-clamp-2">{project.description}</p>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
            >
              Visit Project Website
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </Card>

        {/* Review Form */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">
            {userHasReviewed ? 'Your Review' : 'Leave Your Feedback'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {project.reviewSchema.map((schema, index) => {
              const userAnswer = userReview 
                ? userReview.filledReviewSchema.find(s => s.question === schema.question)?.answer
                : answers[index];
              
              return (
              <div key={index} className="space-y-3">
                <Label className="text-base">
                  {index + 1}. {schema.question} *
                </Label>

                {schema.type === 'short-answer' && (
                  <Textarea
                    value={(userAnswer as string) || ''}
                    onChange={(e) => !userHasReviewed && handleAnswerChange(index, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                    disabled={userHasReviewed}
                    className={userHasReviewed ? 'bg-secondary/30' : ''}
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
                        <RadioGroupItem value={choice} id={`q${index}-c${cIndex}`} disabled={userHasReviewed} />
                        <Label htmlFor={`q${index}-c${cIndex}`} className={`font-normal ${userHasReviewed ? '' : 'cursor-pointer'}`}>
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
                        />
                        <Label htmlFor={`q${index}-c${cIndex}`} className={`font-normal ${userHasReviewed ? '' : 'cursor-pointer'}`}>
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
                className="w-full gradient-primary text-white"
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

export default ViewProjectPage;
