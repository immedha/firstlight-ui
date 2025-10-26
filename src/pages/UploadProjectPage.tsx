import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createProjectAction } from '@/store/user/userActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Upload } from 'lucide-react';
import { ReviewSchema } from '@/types';
import { toast } from 'sonner';

const UploadProjectPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.user.userId);
  
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Default review schema for web app MVPs
  const defaultQuestions: ReviewSchema[] = [
    {
      question: 'What did you think of the overall user experience?',
      type: 'short-answer'
    },
    {
      question: 'Which features would you use most?',
      type: 'multiple-choice',
      choices: ['Messaging', 'Analytics', 'Collaboration Tool']
    },
    {
      question: 'What would you improve first?',
      type: 'single-choice',
      choices: ['Design', 'Performance/Speed', 'Feature completeness']
    },
    {
      question: 'Would you recommend this to a friend?',
      type: 'single-choice',
      choices: ['Yes', 'No']
    }
  ];
  
  const [questions, setQuestions] = useState<ReviewSchema[]>(defaultQuestions);

  const addQuestion = () => {
    if (questions.length >= 6) {
      toast.error('Maximum 6 questions allowed (1 short answer + 5 choice questions)');
      return;
    }
    setQuestions([...questions, { question: '', type: 'single-choice', choices: ['', ''] }]);
  };

  const updateQuestion = (index: number, field: keyof ReviewSchema, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addChoice = (questionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].choices) {
      updated[questionIndex].choices!.push('');
      setQuestions(updated);
    }
  };

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    const updated = [...questions];
    if (updated[questionIndex].choices) {
      updated[questionIndex].choices![choiceIndex] = value;
      setQuestions(updated);
    }
  };

  const removeChoice = (questionIndex: number, choiceIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].choices && updated[questionIndex].choices!.length > 2) {
      updated[questionIndex].choices!.splice(choiceIndex, 1);
      setQuestions(updated);
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('You must be signed in to upload a project');
      return;
    }

    // Validation
    if (!projectName.trim() || !description.trim() || !link.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Validate questions
    for (const q of questions) {
      if (!q.question.trim()) {
        toast.error('All questions must have text');
        return;
      }
      if (q.type !== 'short-answer') {
        if (!q.choices || q.choices.length < 2) {
          toast.error('Choice questions must have at least 2 options');
          return;
        }
        if (q.choices.some(c => !c.trim())) {
          toast.error('All answer choices must be filled');
          return;
        }
      }
    }

    dispatch(createProjectAction({
      name: projectName.trim(),
      description: description.trim(),
      link: link.trim(),
      reviewSchema: questions
    }));
    
    navigate('/projects');
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Upload Your Project</h1>
          <p className="text-muted-foreground text-lg">
            Share your project and create custom review questions to get the feedback you need
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Details */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Project Details</h2>
            
            <div>
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Startup"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project in detail..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="link">Website Link *</Label>
              <Input
                id="link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
              />
            </div>
          </Card>

          {/* Review Questions */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Review Questions</h2>
              <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Add questions to create your review schema (1 short answer + max 5 choice questions)
              </p>
            )}

            {questions.map((question, qIndex) => (
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-3">
                    <Input
                      value={question.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      placeholder="Enter your question"
                    />

                    <Select
                      value={question.type}
                      onValueChange={(value) => updateQuestion(qIndex, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short-answer">Short Answer</SelectItem>
                        <SelectItem value="single-choice">Single Choice</SelectItem>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      </SelectContent>
                    </Select>

                    {question.type !== 'short-answer' && (
                      <div className="space-y-2">
                        <Label className="text-xs">Answer Choices</Label>
                        {question.choices?.map((choice, cIndex) => (
                          <div key={cIndex} className="flex gap-2">
                            <Input
                              value={choice}
                              onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)}
                              placeholder={`Choice ${cIndex + 1}`}
                              className="text-sm"
                            />
                            {question.choices!.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeChoice(qIndex, cIndex)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addChoice(qIndex)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Choice
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </Card>

          <Button type="submit" size="lg" className="w-full gradient-primary text-white">
            <Upload className="w-4 h-4 mr-2" />
            Upload Project
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default UploadProjectPage;
