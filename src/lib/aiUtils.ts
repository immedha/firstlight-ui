import { ReviewSchema } from '@/types';
import { functions } from '@/firebase';
import { httpsCallable } from 'firebase/functions';

/**
 * Generate survey questions using Firebase Function (server-side AI)
 * @param productName - Name of the product
 * @param description - Description of the product
 * @param feedbackObjective - What kind of feedback the user is looking for (optional)
 * @returns Array of up to 5 survey questions
 */
export async function generateSurveyQuestions(
  productName: string,
  description: string,
  feedbackObjective?: string
): Promise<ReviewSchema[]> {
  try {
    const generateQuestions = httpsCallable<{ productName: string; description: string; feedbackObjective?: string }, { questions: ReviewSchema[] }>(
      functions,
      'generateSurveyQuestions'
    );

    const result = await generateQuestions({
      productName,
      description,
      feedbackObjective
    });

    return result.data.questions;
  } catch (error) {
    console.error('Error generating survey questions:', error);
    
    // Fallback: Return sensible default questions if Firebase function fails
    return generateSurveyQuestionsFallback(productName, description, feedbackObjective);
  }
}

/**
 * Generate survey questions using a simpler fallback method
 * This doesn't require an AI API key
 */
export function generateSurveyQuestionsFallback(
  productName: string,
  description: string,
  feedbackObjective?: string
): ReviewSchema[] {
  // Extract key topics from description and feedback objective
  const keywords = extractKeywords(description + ' ' + (feedbackObjective || ''));
  
  const questionTemplates: ReviewSchema[] = [
    {
      question: `How would you rate your overall experience with ${productName}?`,
      type: 'single-choice' as const,
      choices: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent']
    },
    {
      question: 'How easy was it to use this product?',
      type: 'single-choice' as const,
      choices: ['Very Difficult', 'Difficult', 'Neutral', 'Easy', 'Very Easy']
    },
    {
      question: 'What specific features did you find most valuable?',
      type: 'short-answer' as const
    },
    {
      question: 'How likely are you to continue using this product?',
      type: 'single-choice' as const,
      choices: ['Not Likely', 'Unlikely', 'Neutral', 'Likely', 'Very Likely']
    },
    {
      question: 'What challenges did you encounter while using the product?',
      type: 'short-answer' as const
    }
  ];

  // Customize based on keywords
  if (keywords.includes('design') || keywords.includes('ui') || keywords.includes('interface')) {
    questionTemplates.push({
      question: 'How would you rate the visual design and user interface?',
      type: 'single-choice' as const,
      choices: ['Poor', 'Below Average', 'Average', 'Above Average', 'Excellent']
    });
  }

  return questionTemplates.slice(0, 5);
}

function extractKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  const commonKeywords = [
    'design', 'ui', 'interface', 'user experience', 'ux',
    'features', 'functionality', 'performance', 'speed',
    'support', 'customer service', 'documentation', 'tutorial',
    'mobile', 'app', 'web', 'platform', 'integration',
    'security', 'privacy', 'data', 'analytics', 'reporting'
  ];
  
  return commonKeywords.filter(keyword => lowerText.includes(keyword));
}
