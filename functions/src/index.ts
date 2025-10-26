import {setGlobalOptions} from "firebase-functions/v2/options";
import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {defineSecret} from "firebase-functions/params";
import OpenAI from "openai";
import {zodResponseFormat} from "openai/helpers/zod";
import {z} from "zod";


// Define secret parameter
const openaiApiKey = defineSecret("OPENAI_API_KEY");

setGlobalOptions({ maxInstances: 10 });

interface GenerateQuestionsRequest {
  productName: string;
  description: string;
  feedbackObjective?: string;
}

// Zod schema for structured output
const questionSchema = z.object({
  question: z.string(),
  type: z.enum(["short-answer", "single-choice", "multiple-choice"]),
  choices: z.array(z.string()).optional(),
});

const surveyQuestionsSchema = z.object({
  questions: z.array(questionSchema).max(4),
});

const get_prompt = (productName: string, description: string, feedbackObjective: string) => {
  return `
  The user is an early stage founder and just created a new app. They want to get feedback from some users
  about it. They want users to try their app and fill out a review form with some short answer and 
  multiple choice or single choice questions about it. You are an expert survey designer and your job is
  to generate review questions in the JSON structured schema I provided for their product. Here is the product info:

  Product Name: ${productName}
  Description: ${description}
  ${'Here is some extra info the user gave about their objectives for the review form:' + feedbackObjective}
  

  You must generate good review questions that are easy to fill out for users and understand. The purpose is to 
  make the user succeed in achieving product market fit for their app, so the questions should be good enough
  that answer from users will glean important insights about the product and the market.

  Make sure that for any multiple or single choice questions you generate, there are only 2-3 options - not too many.
  And there should only be 1 short answer question. And total max 4 questions, but less is also good. Simple is better.
  Make sure the questions are not generic - it shoudl be obvious they are specific to the product.
  And PLEASE don't use a pattern like "very poor, poor, average, good, very good, excellent" for options - that is too many.
  `;
}

export const generateSurveyQuestions = onCall({ secrets: [openaiApiKey], },
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

      const client = new OpenAI({ apiKey: openaiApiKey.value() });
      const completion = await client.beta.chat.completions.parse({
        model: "gpt-4o-mini-2024-07-18",
        messages: [
          {
            role: "system",
            content: get_prompt(productName, description, feedbackObjective || ''),
          },
        ],
        response_format: zodResponseFormat(surveyQuestionsSchema, "questions"),
        temperature: 0.2,
      });

      let result: any = completion.choices[0].message.parsed;
      if (!result) {
        logger.error("No result returned from OpenAI");
        return { questions: [] };
      }
      return { questions: result.questions };
  } catch (error) {
    logger.error("Error generating survey questions", error);
    return { questions: [] };
  }
}
);
