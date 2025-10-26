import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createProjectAction, updateProjectAction } from '@/store/user/userActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Upload, Image as ImageIcon, Star, X, Save, Sparkles } from 'lucide-react';
import { ReviewSchema, ProductImage } from '@/types';
import { toast } from 'sonner';
import { uploadMultipleImages, validateImageFile } from '@/lib/storageUtils';
import { generateSurveyQuestions, generateSurveyQuestionsFallback } from '@/lib/aiUtils';

const UploadProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.user.userId);
  const { projectId } = useParams<{ projectId: string }>();
  
  const existingProduct = useAppSelector(state => 
    state.projects.allProjects.find(p => p.id === projectId && p.founderId === userId)
  );
  
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [feedbackObjective, setFeedbackObjective] = useState('');
  
  const defaultQuestions: ReviewSchema[] = [
    { question: 'What did you think of the overall user experience?', type: 'short-answer' },
    { question: 'Which features would you use most?', type: 'multiple-choice', choices: ['Messaging', 'Analytics', 'Collaboration Tool'] },
  ];
  
  const [questions, setQuestions] = useState<ReviewSchema[]>(defaultQuestions);
  const [uploadedImages, setUploadedImages] = useState<ProductImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (existingProduct && existingProduct.status === 'draft') {
      setProductName(existingProduct.name);
      setDescription(existingProduct.description);
      setLink(existingProduct.link);
      setImageUrl(existingProduct.imageUrl || '');
      setQuestions(existingProduct.reviewSchema);
      if (existingProduct.images) setUploadedImages(existingProduct.images);
    } else if (existingProduct && existingProduct.status === 'published') {
      toast.error('Cannot edit published products');
      navigate('/my-products');
    }
  }, [existingProduct, navigate]);

  const addQuestion = () => {
    if (questions.length >= 6) {
      toast.error('Maximum 6 questions allowed');
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }

    setIsUploading(true);
    try {
      const urls = await uploadMultipleImages(files, userId!);
      const newImages: ProductImage[] = urls.map((url, index) => ({
        url,
        isPrimary: uploadedImages.length === 0 && index === 0
      }));
      setUploadedImages([...uploadedImages, ...newImages]);
      toast.success(`${files.length} image(s) uploaded!`);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    const updated = uploadedImages.map((img, i) => ({ ...img, isPrimary: i === index }));
    setUploadedImages(updated);
  };

  const handleGenerateQuestions = async () => {
    if (!productName.trim() || !description.trim()) {
      toast.error('Please provide product name and description first');
      return;
    }

    setIsGenerating(true);
    try {
      toast.info('Generating survey questions...');
      
      const generatedQuestions = await generateSurveyQuestions(productName, description, feedbackObjective);
      
      setQuestions(generatedQuestions);
      toast.success(`Generated ${generatedQuestions.length} survey questions!`);
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate questions. Please try again or add them manually.');
      
      // Try fallback method on error
      try {
        const fallbackQuestions = generateSurveyQuestionsFallback(productName, description, feedbackObjective);
        setQuestions(fallbackQuestions);
        toast.info('Using fallback questions');
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault();

    if (!userId) {
      toast.error('Sign in to add a product');
      return;
    }

    if (status === 'published') {
      if (!productName.trim() || !description.trim() || !link.trim()) {
        toast.error('Fill in all required fields');
        return;
      }
      if (questions.length === 0) {
        toast.error('Add at least one question');
        return;
      }
      for (const q of questions) {
        if (!q.question.trim()) {
          toast.error('All questions must have text');
          return;
        }
        if (q.type !== 'short-answer' && (!q.choices || q.choices.length < 2 || q.choices.some(c => !c.trim()))) {
          toast.error('Choice questions need at least 2 filled options');
          return;
        }
      }
    }

    const productData = {
      name: productName.trim(),
      description: description.trim(),
      link: link.trim(),
      reviewSchema: questions,
      imageUrl: imageUrl.trim(),
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
      status
    };

    if (existingProduct && existingProduct.status === 'draft') {
      dispatch(updateProjectAction({ ...productData, projectId: existingProduct.id }));
    } else {
      dispatch(createProjectAction(productData));
    }
    navigate('/my-products');
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {existingProduct ? 'Edit Product' : 'Add Product'}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {existingProduct ? 'Update your draft and publish when ready' : 'Share your product and create review questions'}
          </p>
        </div>

        <form className="space-y-4">
          <Card className="p-4 space-y-3">
            <h2 className="text-base font-semibold">Product Details</h2>
            
            <div>
              <Label htmlFor="productName" className="text-xs">Product Name *</Label>
              <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="My Awesome Product" className="h-9 text-sm" />
            </div>

            <div>
              <Label htmlFor="description" className="text-xs">Description *</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your product..." rows={3} className="text-sm" />
            </div>

            <div>
              <Label htmlFor="link" className="text-xs">Website Link *</Label>
              <Input id="link" type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://example.com" className="h-9 text-sm" />
            </div>

            <div>
              <Label htmlFor="imageUrl" className="text-xs">Image URL (optional)</Label>
              <Input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" className="h-9 text-sm" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Upload Images (PNG/JPG, max 500KB)</Label>
                <input type="file" accept="image/png,image/jpeg,image/jpg" multiple onChange={handleFileChange} disabled={isUploading} className="hidden" id="image-upload" />
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('image-upload')?.click()} disabled={isUploading} className="h-7 text-xs">
                  <ImageIcon className="w-3 h-3 mr-1.5" />
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video border rounded-md overflow-hidden relative" style={{ borderColor: img.isPrimary ? 'hsl(var(--primary))' : 'transparent', borderWidth: img.isPrimary ? '2px' : '1px' }}>
                        <img src={img.url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <Button type="button" variant="secondary" size="sm" onClick={() => setPrimaryImage(index)} disabled={img.isPrimary} className="h-6 text-xs px-2">
                            <Star className={`w-3 h-3 ${img.isPrimary ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                          <Button type="button" variant="destructive" size="sm" onClick={() => removeImage(index)} className="h-6 text-xs px-2">
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Review Questions</h2>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  onClick={handleGenerateQuestions} 
                  variant="default" 
                  size="sm"
                  disabled={isGenerating || !productName.trim() || !description.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Questions'}
                </Button>
                <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>

            {!productName.trim() || !description.trim() ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  💡 Fill in the product name and description above to enable AI question generation.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="text-sm text-purple-900 dark:text-purple-200">
                  ✨ Click "Generate Questions" to let AI create up to 5 tailored survey questions. 
                  Specify what feedback you're looking for below to get more targeted questions. Questions can be customized after generation.
                </p>
              </div>
            )}

            {questions.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Add questions to create your review schema (1 short answer + max 5 choice questions)
              </p>
            )}

            <div>
              <Label htmlFor="feedbackObjective" className="text-xs">What feedback are you looking for? (Optional)</Label>
              <Textarea 
                id="feedbackObjective" 
                value={feedbackObjective} 
                onChange={(e) => setFeedbackObjective(e.target.value)} 
                placeholder="e.g., I want to understand user satisfaction, feature usage, and pain points" 
                rows={2} 
                className="text-sm" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                Describe what kind of feedback you want from reviewers to help AI generate better questions
              </p>
            </div>
            {questions.map((question, qIndex) => (
              <motion.div key={qIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 border rounded-md space-y-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <Input value={question.question} onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)} placeholder="Question" className="h-8 text-xs" />
                    <Select value={question.type} onValueChange={(value) => updateQuestion(qIndex, 'type', value)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short-answer">Short Answer</SelectItem>
                        <SelectItem value="single-choice">Single Choice</SelectItem>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      </SelectContent>
                    </Select>
                    {question.type !== 'short-answer' && (
                      <div className="space-y-1.5">
                        {question.choices?.map((choice, cIndex) => (
                          <div key={cIndex} className="flex gap-1.5">
                            <Input value={choice} onChange={(e) => updateChoice(qIndex, cIndex, e.target.value)} placeholder={`Choice ${cIndex + 1}`} className="h-7 text-xs" />
                            {question.choices!.length > 2 && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeChoice(qIndex, cIndex)} className="h-7 w-7 p-0">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => addChoice(qIndex)} className="h-7 text-xs">
                          <Plus className="w-3 h-3 mr-1.5" />
                          Choice
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(qIndex)} className="h-7 w-7 p-0">
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </Card>

          <div className="flex gap-2">
            <Button type="submit" onClick={(e) => handleSubmit(e, 'draft')} size="lg" variant="outline" className="flex-1 h-10 text-sm">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button type="submit" onClick={(e) => handleSubmit(e, 'published')} size="lg" className="flex-1 gradient-primary text-white h-10 text-sm">
              <Upload className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UploadProductPage;
