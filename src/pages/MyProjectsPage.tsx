import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateReviewQuality } from '@/store/reviewsSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { ReviewGiven } from '@/types';

const MyProjectsPage = () => {
  const dispatch = useAppDispatch();
  const allProjects = useAppSelector(state => state.projects.allProjects);
  const allReviews = useAppSelector(state => state.reviews.allReviews);
  
  const [founderName, setFounderName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [tempRating, setTempRating] = useState(0);

  useEffect(() => {
    const storedName = localStorage.getItem('reviewerName');
    if (storedName) {
      setFounderName(storedName);
    }
  }, []);

  const myProjects = allProjects.filter(p => p.founderName === founderName);
  const selectedProject = myProjects.find(p => p.id === selectedProjectId);
  
  const projectReviews = selectedProject
    ? allReviews.filter(r => selectedProject.reviewsReceived.includes(r.id))
    : [];

  const currentReview: ReviewGiven | null = projectReviews[currentReviewIndex] || null;

  const handleRateReview = (rating: number) => {
    if (currentReview) {
      dispatch(updateReviewQuality({ id: currentReview.id, quality: rating }));
      setTempRating(rating);
    }
  };

  const canGoNext = currentReview && (currentReview.reviewQuality > 0 || tempRating > 0);

  const handleNext = () => {
    if (canGoNext && currentReviewIndex < projectReviews.length - 1) {
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

  if (!founderName) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Set Your Name First</h2>
          <p className="text-muted-foreground mb-6">
            Please review a project first to set your name, then you can view your uploaded projects.
          </p>
          <Link to="/projects">
            <Button className="gradient-primary text-white">Browse Projects</Button>
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
          <h2 className="text-3xl font-bold mb-4">No Projects Yet</h2>
          <p className="text-muted-foreground mb-8">
            Upload your first project to start receiving feedback from fellow founders!
          </p>
          <Link to="/upload-project">
            <Button size="lg" className="gradient-primary text-white">
              Upload Your Project
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
          <h1 className="text-4xl font-bold mb-4">My Projects</h1>
          <p className="text-muted-foreground text-lg">
            View and manage feedback for your projects
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Select a Project</label>
          <Select value={selectedProjectId || ''} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Choose a project" />
            </SelectTrigger>
            <SelectContent>
              {myProjects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name} ({project.reviewsReceived.length} reviews)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProject && (
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedProject.name}</h2>
              <p className="text-muted-foreground mb-4">{selectedProject.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Total Reviews: {projectReviews.length}</span>
                <a
                  href={selectedProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View Project
                </a>
              </div>
            </Card>

            {projectReviews.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground">
                  Share your project to start receiving feedback!
                </p>
              </Card>
            ) : (
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">
                    Review {currentReviewIndex + 1} of {projectReviews.length}
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
                      disabled={!canGoNext || currentReviewIndex === projectReviews.length - 1}
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
                          <p className="font-medium">{currentReview.reviewerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(currentReview.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-2">Rate this review</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRateReview(star)}
                                className="transition-transform hover:scale-110"
                                disabled={currentReview.reviewQuality > 0}
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

                      {!canGoNext && currentReviewIndex < projectReviews.length - 1 && (
                        <p className="text-sm text-center text-muted-foreground pt-4">
                          Rate this review to see the next one
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MyProjectsPage;
