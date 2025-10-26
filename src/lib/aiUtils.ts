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
    const myFunction = httpsCallable(functions, 'generateSurveyQuestions');

    const result = await myFunction({
      productName,
      description,
      feedbackObjective
    });
    console.log(result.data);

    return (result.data as { questions: ReviewSchema[] }).questions;
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
  // Return only 2 simple questions
  return [
    {
      question: `Would you use ${productName}?`,
      type: 'single-choice' as const,
      choices: ['Yes', 'No']
    },
    {
      question: 'What feedback do you have for improving this product?',
      type: 'short-answer' as const
    }
  ];
}

