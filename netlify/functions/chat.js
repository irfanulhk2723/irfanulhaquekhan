const { GoogleGenAI } = require('@google/genai');

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // 1. Initialize the Gemini client using the environment variable
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // 2. Parse payload incoming from your frontend index.html
    const { systemInstruction, contents } = JSON.parse(event.body);

    // 3. Format history array natively for Gemini API specs
    // Gemini expects structure: contents: [{ role: 'user'|'model', parts: [{ text: '...' }] }]
    const formattedContents = contents.map(msg => ({
      role: msg.role === 'irfan' ? 'model' : 'user',
      parts: msg.parts.map(p => ({ text: p.text }))
    }));

    // 4. Call the Gemini Flash model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    // 5. Return response text back to frontend chat container
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: response.text }),
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to communicate with AI layer' }),
    };
  }
};
