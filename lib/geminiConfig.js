import { GoogleGenerativeAI } from '@google/generative-ai';

// WORKING MODEL from your API key
export const GEMINI_MODEL = 'gemini-2.5-flash';

// Free tier rate limits (gemini-2.5-flash)
export const RATE_LIMITS = {
  requestsPerMinute: 15,
  requestsPerDay: 1500,
  tokensPerMinute: 4000000  // 4M tokens/min for 2.5-flash!
};

// Initialize Gemini (reusable)
export function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ 
    model: GEMINI_MODEL 
  });
}

// Helper function for bias analysis (we'll use this in Day 3)
export async function analyzeBias(emailText) {
  const model = getGeminiModel();
  
  const prompt = `You are a bias detection system for Indian college placement processes.

Analyze this placement email for bias patterns:

EMAIL:
${emailText}

Detect these bias types:
1. Gender bias (gendered pronouns, role assumptions)
2. Department discrimination (CS/IT preference over other branches)
3. Caste/community indicators (surname patterns, hostel preferences)
4. Socioeconomic bias (fee requirements, dress codes)
5. Academic elitism (unrealistic CGPA cutoffs)

Return JSON format:
{
  "biasDetected": true/false,
  "confidence": 0-100,
  "patterns": [
    {
      "type": "gender_bias",
      "severity": "high/medium/low",
      "evidence": "exact text from email",
      "reasoning": "explanation"
    }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error('Failed to parse AI response');
}
