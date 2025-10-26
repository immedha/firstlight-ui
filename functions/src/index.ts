/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions/v2/options";
import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {defineSecret} from "firebase-functions/params";
import {OpenAI} from "openai";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// Define secret parameter
const openaiApiKey = defineSecret("OPENAI_API_KEY");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
setGlobalOptions({ maxInstances: 10 });

interface GenerateQuestionsRequest {
  productName: string;
  description: string;
}

interface QuestionSchema {
  question: string;
  type: "short-answer" | "single-choice" | "multiple-choice";
  choices?: string[];
}

/**
 * Generates up to 5 survey questions using OpenAI based on product description
 */
export const generateSurveyQuestions = onCall(
  {
    secrets: [openaiApiKey],
  },
  async (request) => {
    try {
      const {productName, description} = request.data as GenerateQuestionsRequest;

      if (!productName || !description) {
        throw new Error("Product name and description are required");
      }

      // Check if OpenAI API key is configured
      if (!openaiApiKey.value()) {
        logger.warn("OpenAI API key not configured, returning fallback questions");
        return {questions: getFallbackQuestions(productName, description)};
      }

      // Initialize OpenAI
      const openai = new OpenAI({
        apiKey: openaiApiKey.value(),
      });

    const prompt = `Generate up to 5 survey questions for a product called "${productName}" with the following description and feedback goals: "${description}"

Requirements:
1. Generate up to 5 questions (mix of short-answer and choice questions)
2. For choice questions, use a 5-point Likert scale: "Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree" OR provide contextually appropriate multiple choice options
3. At least 2 questions should be choice-based for easy quantitative analysis
4. Questions should be specific, actionable, and related to user experience, feature value, or product satisfaction
5. Generate diverse questions covering different aspects (usability, value, design, features, etc.)

Return the response as a JSON array with this exact format:
[
  {
    "question": "string",
    "type": "short-answer" | "single-choice" | "multiple-choice",
    "choices": ["option1", "option2", ...] // only for choice types
  }
]

Example output format:
[
  {
    "question": "How would you rate the overall user experience?",
    "type": "single-choice",
    "choices": ["Poor", "Fair", "Good", "Very Good", "Excellent"]
  },
  {
    "question": "Which features did you find most valuable?",
    "type": "multiple-choice",
    "choices": ["Feature A", "Feature B", "Feature C", "Feature D"]
  },
  {
    "question": "What specific improvements would enhance your experience?",
    "type": "short-answer"
  }
]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a survey design expert. Generate high-quality survey questions that help product founders gather actionable feedback.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions: QuestionSchema[] = JSON.parse(jsonMatch[0]);
      
      // Validate and limit to 5 questions
      const validatedQuestions = questions.slice(0, 5).map((q) => {
        if (!q.question || !q.type) {
          throw new Error("Invalid question format");
        }
        if (q.type !== "short-answer" && (!q.choices || q.choices.length < 2)) {
          throw new Error("Choice questions must have at least 2 options");
        }
        return q;
      });

      logger.info(`Generated ${validatedQuestions.length} questions for product: ${productName}`);
      return {questions: validatedQuestions};
    } else {
      // Fallback if parsing fails
      logger.warn("Failed to parse AI response, returning fallback questions");
      return {questions: getFallbackQuestions(productName, description)};
    }
  } catch (error) {
    logger.error("Error generating survey questions", error);
    // Return fallback questions on error
    const {productName, description} = request.data as GenerateQuestionsRequest;
    return {questions: getFallbackQuestions(productName, description)};
  }
}
);

/**
 * Fallback questions when AI is not available or fails
 */
function getFallbackQuestions(productName: string, description: string): QuestionSchema[] {
  const questions: QuestionSchema[] = [
    {
      question: `How would you rate your overall experience with ${productName}?`,
      type: "single-choice",
      choices: ["Very Poor", "Poor", "Average", "Good", "Excellent"],
    },
    {
      question: "How easy was it to use this product?",
      type: "single-choice",
      choices: ["Very Difficult", "Difficult", "Neutral", "Easy", "Very Easy"],
    },
    {
      question: "What specific features did you find most valuable?",
      type: "short-answer",
    },
    {
      question: "How likely are you to continue using this product?",
      type: "single-choice",
      choices: ["Not Likely", "Unlikely", "Neutral", "Likely", "Very Likely"],
    },
    {
      question: "What challenges did you encounter while using the product?",
      type: "short-answer",
    },
  ];

  // Customize based on description keywords
  const lowerDescription = description.toLowerCase();
  if (lowerDescription.includes("design") || lowerDescription.includes("ui") || lowerDescription.includes("interface")) {
    questions[1] = {
      question: "How would you rate the visual design and user interface?",
      type: "single-choice",
      choices: ["Poor", "Below Average", "Average", "Above Average", "Excellent"],
    };
  }

  return questions;
}
