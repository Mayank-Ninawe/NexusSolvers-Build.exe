import { GoogleGenerativeAI } from '@google/generative-ai';
import { BiasResult, BiasDetection } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function analyzeBiasWithGemini(text: string): Promise<BiasResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert bias detection AI. Analyze the following text for biases related to gender, age, location, educational background, experience, physical attributes, or socioeconomic status.

Text to analyze:
"${text}"

Provide your analysis in the following JSON format:
{
  "overallScore": <number 0-100>,
  "biasesDetected": [
    {
      "type": "<gender|age|location|educational_background|experience|other>",
      "evidence": "<exact quote from text>",
      "explanation": "<why this is biased>",
      "severity": "<low|medium|high|critical>",
      "suggestedRewrite": "<unbiased version>"
    }
  ],
  "summary": "<brief summary of findings>",
  "severity": "<low|medium|high|critical>",
  "confidence": <number 0-100>
}

Important: Return ONLY valid JSON, no markdown or additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean response (remove markdown if present)
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsedResult: BiasResult = JSON.parse(cleanedResponse);
    return parsedResult;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze text. Please try again.');
  }
}
