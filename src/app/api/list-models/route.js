export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return Response.json({
        success: false,
        error: 'GEMINI_API_KEY not found in environment'
      }, { status: 500 });
    }

    // Use REST API to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch models - API key might be invalid');
    }

    const data = await response.json();
    
    const availableModels = data.models
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => ({
        name: m.name.replace('models/', ''),
        displayName: m.displayName,
        description: m.description
      }));
    
    return Response.json({
      success: true,
      apiKeyValid: true,
      totalModels: availableModels.length,
      models: availableModels,
      recommendedModels: [
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest'
      ]
    });
    
  } catch (error) {
    console.error('List Models Error:', error);
    
    return Response.json({
      success: false,
      apiKeyValid: false,
      error: error.message,
      hint: 'Your API key might be invalid. Generate new one at https://aistudio.google.com/app/apikey'
    }, { status: 500 });
  }
}
