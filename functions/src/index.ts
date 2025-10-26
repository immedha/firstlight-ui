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
  feedbackObjective?: string;
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
      const {productName, description, feedbackObjective} = request.data as GenerateQuestionsRequest;

      if (!productName || !description) {
        throw new Error("Product name and description are required");
      }

      // Check if OpenAI API key is configured
      if (!openaiApiKey.value()) {
        logger.warn("OpenAI API key not configured, returning fallback questions");
        return {questions: getFallbackQuestions(productName, description, feedbackObjective)};
      }

      // Initialize OpenAI
      const openai = new OpenAI({
        apiKey: openaiApiKey.value(),
      });

    const prompt = feedbackObjective 
      ? `You are generating survey questions for a product called "${productName}" (${description}).

CRITICAL: The primary goal is to gather feedback on: "${feedbackObjective}"

Generate up to 5 highly targeted survey questions that directly address this specific feedback objective. 

Requirements:
1. EVERY question must be relevant to understanding: "${feedbackObjective}"
2. Questions should be specific, not generic
3. Mix of question types: some short-answer (to understand "why"), some choice-based (for quick quantitative insights)
4. For ALL single-choice questions, use 5-point Likert scales as options. Standard Likert scales should be:
   - Agreement: "Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"
   - Frequency: "Never", "Rarely", "Sometimes", "Often", "Always"
   - Quality: "Poor", "Fair", "Good", "Very Good", "Excellent"
   - Satisfaction: "Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"
5. For multiple-choice questions, provide specific contextual options (not Likert scale)
6. If the feedback objective mentions frequency (like "daily use"), include a question about usage frequency with Likert scale
7. If the feedback objective asks about barriers or reasons, include questions that explore those barriers
8. Generate 3-5 questions total

Return the response as a JSON array with this exact format:
[
  {
    "question": "string",
    "type": "short-answer" | "single-choice" | "multiple-choice",
    "choices": ["option1", "option2", ...] // only for choice types
  }
]

Example for feedback objective "understand if users will use this daily":
[
  {
    "question": "How often do you plan to use this product?",
    "type": "single-choice",
    "choices": ["Never", "Rarely", "Sometimes", "Often", "Always"]
  },
  {
    "question": "I would use this product on a daily basis",
    "type": "single-choice",
    "choices": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
  },
  {
    "question": "What factors would prevent you from using this product daily?",
    "type": "multiple-choice",
    "choices": ["Not useful enough", "Too complicated", "Not integrated into my workflow", "I prefer alternatives", "Other"]
  },
  {
    "question": "Please explain your answer above in more detail",
    "type": "short-answer"
  }
]`
      : `Generate up to 5 survey questions for a product called "${productName}" with description: "${description}"

Requirements:
1. Generate 3-5 questions (mix of short-answer and choice questions)
2. Questions should be specific and actionable, directly related to the product
3. For ALL single-choice questions, use 5-point Likert scales. Standard options:
   - Agreement: "Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"
   - Frequency: "Never", "Rarely", "Sometimes", "Often", "Always"
   - Quality: "Poor", "Fair", "Good", "Very Good", "Excellent"
   - Satisfaction: "Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"
4. For multiple-choice questions, provide specific contextual options (not Likert scale)
5. At least 2 questions should be choice-based for quantitative analysis
6. Generate diverse questions covering usability, value, design, features

Return the response as a JSON array with this exact format:
[
  {
    "question": "string",
    "type": "short-answer" | "single-choice" | "multiple-choice",
    "choices": ["option1", "option2", ...] // only for choice types
  }
]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert survey designer specializing in user research. Your job is to create highly targeted, specific survey questions that directly address the stated feedback objectives. When a feedback objective is provided, generate questions that drill deep into that specific area rather than asking generic questions. Focus on actionable insights that will help the product founder make data-driven decisions.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
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
      return {questions: getFallbackQuestions(productName, description, feedbackObjective)};
    }
  } catch (error) {
    logger.error("Error generating survey questions", error);
    // Return fallback questions on error
    const {productName, description, feedbackObjective} = request.data as GenerateQuestionsRequest;
    return {questions: getFallbackQuestions(productName, description, feedbackObjective)};
  }
}
);

/**
 * Fallback questions when AI is not available or fails
 */
function getFallbackQuestions(productName: string, description: string, feedbackObjective?: string): QuestionSchema[] {
  
  // If feedback objective is provided, try to create tailored questions
  if (feedbackObjective) {
    const objective = feedbackObjective.toLowerCase();
    const questions: QuestionSchema[] = [];
    
    // Check for daily/weekly use frequency questions
    if (objective.includes("daily") || objective.includes("regularly") || objective.includes("often")) {
      questions.push({
        question: "How often do you plan to use this product?",
        type: "single-choice",
        choices: ["Daily", "Several times a week", "Once a week", "A few times a month", "Rarely or never"],
      });
    }
    
    // Check for "why not" or barrier questions
    if (objective.includes("why not") || objective.includes("prevent") || objective.includes("barrier")) {
      questions.push({
        question: "What would prevent you from using this product more frequently?",
        type: "multiple-choice",
        choices: ["It's not useful enough", "Too complicated to use", "Not integrated into my workflow", "I prefer other solutions", "Other"],
      });
      questions.push({
        question: "Please explain in more detail what prevents you from using this product",
        type: "short-answer",
      });
    }
    
    // Check for satisfaction questions
    if (objective.includes("satisfied") || objective.includes("satisfaction") || objective.includes("happy")) {
      questions.push({
        question: "How satisfied are you with this product?",
        type: "single-choice",
        choices: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"],
      });
    }
    
    // Check for feature usage questions
    if (objective.includes("feature") || objective.includes("use")) {
      questions.push({
        question: "Which features did you find most useful?",
        type: "multiple-choice",
        choices: ["Feature A", "Feature B", "Feature C", "Feature D"],
      });
    }
    
    // Check for design/UI questions
    if (objective.includes("design") || objective.includes("ui") || objective.includes("interface") || objective.includes("layout")) {
      questions.push({
        question: "How would you rate the visual design and user interface?",
        type: "single-choice",
        choices: ["Poor", "Below Average", "Average", "Above Average", "Excellent"],
      });
    }
    
    // Always add one generic question if we have less than 3
    if (questions.length < 3) {
      questions.push({
        question: "What improvements would make this product more valuable to you?",
        type: "short-answer",
      });
    }
    
    // Fill up to 5 questions with generic ones if needed
    while (questions.length < 5) {
      questions.push({
        question: `How would you rate your overall experience with ${productName}?`,
        type: "single-choice",
        choices: ["Very Poor", "Poor", "Average", "Good", "Excellent"],
      });
      if (questions.length >= 5) break;
      
      questions.push({
        question: "What specific features or aspects would you like to see improved?",
        type: "short-answer",
      });
      if (questions.length >= 5) break;
    }
    
    return questions.slice(0, 5);
  }
  
  // Default generic questions if no feedback objective
  return [
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
}
