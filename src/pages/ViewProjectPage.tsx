import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addReview } from '@/store/reviewsSlice';
import { addReviewToProject } from '@/store/projectsSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ExternalLink, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { FilledReviewSchema } from '@/types';
import { toast } from 'sonner';

const ViewProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  
  const project = useAppSelector(state => 
    state.projects.allProjects.find(p => p.id === projectId)
  );

  const existingReviews = useAppSelector(state =>
    state.reviews.allReviews.filter(r => r.projectId === projectId)
  );

  const [reviewerName, setReviewerName] = useState('');
  const [answers, setAnswers] = useState<{ [key: number]: string | string[] }>({});
  const [submitted, setSubmitted] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('reviewerName');
    if (storedName) {
      setReviewerName(storedName);
      // Check if this user already reviewed this project
      const hasReviewed = existingReviews.some(r => r.reviewerName === storedName);
      setUserHasReviewed(hasReviewed);
    }
  }, [existingReviews]);

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

    if (!reviewerName.trim()) {
      toast.error('Please enter your name');
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

    const review = {
      id: crypto.randomUUID(),
      reviewerName: reviewerName.trim(),
      projectId: project.id,
      filledReviewSchema: filledSchema,
      createdAt: new Date().toISOString(),
      reviewQuality: 0
    };

    dispatch(addReview(review));
    dispatch(addReviewToProject({ projectId: project.id, reviewId: review.id }));
    
    localStorage.setItem('reviewerName', reviewerName.trim());
    setSubmitted(true);
    toast.success('Review submitted successfully!');
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-12 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
            <p className="text-muted-foreground mb-8">
              Your feedback has been submitted successfully. The founder will really appreciate your insights!
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/projects">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
              <Link to="/upload-project">
                <Button className="gradient-primary text-white">
                  Upload Your Project
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

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
        className="space-y-8"
      >
        {/* Project Info */}
        <Card className="overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative">
            {project.imageUrl ? (
              <img
                src={project.imageUrl}
                alt={project.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl font-bold text-primary/30">
                  {project.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
            <p className="text-muted-foreground mb-4">By {project.founderName}</p>
            <p className="text-lg mb-6">{project.description}</p>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Visit Project Website
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </Card>

        {/* Review Form */}
        {userHasReviewed ? (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">You've Already Reviewed This Project</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your feedback! Each user can only submit one review per project.
            </p>
            <Link to="/projects">
              <Button variant="outline">
                Browse Other Projects
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Leave Your Feedback</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="reviewerName">Your Name *</Label>
                <Input
                  id="reviewerName"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              {project.reviewSchema.map((schema, index) => (
                <div key={index} className="space-y-3">
                  <Label className="text-base">
                    {index + 1}. {schema.question} *
                  </Label>

                  {schema.type === 'short-answer' && (
                    <Textarea
                      value={(answers[index] as string) || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder="Type your answer here..."
                      rows={4}
                    />
                  )}

                  {schema.type === 'single-choice' && (
                    <RadioGroup
                      value={(answers[index] as string) || ''}
                      onValueChange={(value) => handleAnswerChange(index, value)}
                    >
                      {schema.choices?.map((choice, cIndex) => (
                        <div key={cIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={choice} id={`q${index}-c${cIndex}`} />
                          <Label htmlFor={`q${index}-c${cIndex}`} className="font-normal cursor-pointer">
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
                            checked={((answers[index] as string[]) || []).includes(choice)}
                            onCheckedChange={(checked) => 
                              handleCheckboxChange(index, choice, checked as boolean)
                            }
                          />
                          <Label htmlFor={`q${index}-c${cIndex}`} className="font-normal cursor-pointer">
                            {choice}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <Button
                type="submit"
                size="lg"
                className="w-full gradient-primary text-white"
                disabled={!allQuestionsAnswered() || !reviewerName.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Review
              </Button>
            </form>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default ViewProjectPage;
