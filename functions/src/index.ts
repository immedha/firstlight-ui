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
        throw new Error("OpenAI API key not configured");
      }

      // Initialize OpenAI
      const openai = new OpenAI({
        apiKey: openaiApiKey.value(),
      });

    const prompt = feedbackObjective 
      ? `Generate 3-5 survey questions for a product called "${productName}" described as: "${description}"

PRIMARY FEEDBACK OBJECTIVE: "${feedbackObjective}"

CRITICAL RULES:
1. EVERY question MUST directly help understand: "${feedbackObjective}"
2. NO DUPLICATE questions - each question must address a UNIQUE aspect of the feedback objective
3. NO GENERIC questions - make questions specific to the product and feedback objective
4. Questions should explore DIFFERENT DIMENSIONS of the feedback objective

Requirements:
1. Generate 3-5 questions total
2. Mix of question types: short-answer (for "why" and details), single-choice (for quick metrics), multiple-choice (for specific barriers/features)
3. For ALL single-choice questions, use 5-point Likert scales ONLY:
   - Agreement: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
   - Frequency: ["Never", "Rarely", "Sometimes", "Often", "Always"]
   - Quality: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
   - Satisfaction: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"]
4. For multiple-choice questions, create specific options relevant to the feedback objective
5. Each question must uncover a DIFFERENT insight

Return the response as a JSON array with this exact format:
[
  {
    "question": "string",
    "type": "short-answer" | "single-choice" | "multiple-choice",
    "choices": ["option1", "option2", ...] // only for choice types, use EXACTLY 5 options for single-choice
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
    "question": "What factors would prevent you from using this product daily?",
    "type": "multiple-choice",
    "choices": ["Not useful enough", "Too complicated", "Not integrated into my workflow", "I prefer alternatives", "Other"]
  },
  {
    "question": "What would make you use this product more frequently?",
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
          content: `You are an expert survey designer. Generate DISTINCT, highly targeted questions. Rules:
1. NEVER create duplicate or redundant questions
2. Each question must explore a UNIQUE dimension of the feedback objective
3. Make questions specific to the product - avoid generic survey questions
4. Ensure questions work together to comprehensively understand the feedback objective
5. Use Likert scales ONLY for single-choice questions
6. Create contextual, specific options for multiple-choice questions`,
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
      // Throw error if parsing fails
      logger.error("Failed to parse AI response");
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    logger.error("Error generating survey questions", error);
    // Re-throw error instead of returning fallback
    throw error;
  }
}
);
