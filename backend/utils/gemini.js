import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PROMPTS = {
    Food: `Analyze this product label's ingredients and categorize them into:
      1. Positive health implications
      2. Negative health implications
      Also provide an overall health rating out of 10.
      Format the response as:
      Rating: X/10
      Positive: [bullet points]
      Negative: [bullet points]`,
    Cosmetics: `Analyze this cosmetic product's ingredients and categorize them into:
      1. Beneficial ingredients
      2. Potentially harmful ingredients
      Provide a safety rating out of 10.
      Format as:
      Rating: X/10
      Positive: [bullet points]
      Negative: [bullet points]`,
    Medicine: `Analyze this medicine's ingredients and provide:
      1. Active ingredients and benefits
      2. Potential side effects
      Rate its safety profile out of 10.
      Format as:
      Rating: X/10
      Positive: [bullet points]
      Negative: [bullet points]`,
  };

export const analyzeImage = async (imageBase64, category) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = PROMPTS[category] || PROMPTS.Food;
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    return text;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
}; 