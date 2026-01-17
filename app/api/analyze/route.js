import { analyzeBias } from '@/lib/geminiConfig';

export async function POST(request) {
  try {
    const { emailText } = await request.json();
    
    if (!emailText || !emailText.trim()) {
      return Response.json({ error: 'Email text is required' }, { status: 400 });
    }
    
    // Call Gemini AI for bias analysis
    const analysis = await analyzeBias(emailText);
    
    return Response.json({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Bias Analysis Error:', error);
    
    return Response.json({
      success: false,
      error: error.message || 'Failed to analyze email'
    }, { status: 500 });
  }
}
