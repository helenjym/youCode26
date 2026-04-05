import { VertexAI, GoogleGenAI } from '@google/genai';

// Initialize with your API Key from Google AI Studio
const client = new GoogleGenAI({ 
  apiKey: 'AIzaSyAa6_BVHD7Wy9R2XKi4v5tRqKs7HIO9DFs' 
});

async function askGemini() {
  try {
    // 1. Select the model (Flash is great for speed and low cost)
    const model = 'gemini-2.0-flash';

    // 2. Generate content
    const result = await client.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: 'Explain the event loop in Node.js.' }] }]
    });

    // 3. Log the response
    console.log("Gemini says:", result.response.text());
  } catch (err) {
    console.error("API Error:", err.message);
  }
}

askGemini();