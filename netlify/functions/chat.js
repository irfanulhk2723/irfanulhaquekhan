const { GoogleGenAI } = require('@google/genai');

exports.handler = async function (event, context) {
  // 1. Enforce POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // 2. Safely initialize the SDK client using your environment key
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // 3. Parse user payloads sent from the index.html chat interface
    const { systemInstruction, contents } = JSON.parse(event.body);

    // 4. Clean and format conversation history for Gemini's API specs
    const formattedContents = contents.map(msg => ({
      role: msg.role === 'irfan' ? 'model' : 'user',
      parts: msg.parts.map(p => ({ text: p.text }))
    }));

    // 5. Call the production Gemini model using the stable SDK format
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    // 6. Pass the generated response safely back to the chat UI
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: response.text }),
    };

  } catch (error) {
    console.error('Gemini Execution Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Failed to communicate with AI layer',
        details: error.message 
      }),
    };
  }
};
