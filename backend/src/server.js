require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const result = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ 
        role: 'user', 
        parts: [{ text: message + '\n\nRespond with only valid JSON, no markdown, no explanation, no code blocks. The fields should be start_time, end_time, activity, priority' }] 
      }]
    });

    const text = result.text;
    const parsed = JSON.parse(text); // parse the JSON string into an object
    res.json(parsed); // send it back as clean JSON
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/submit', (req, res) => {
    res.send('submitted!')
})

app.get('/models', async (req, res) => {
  try {
    const response = await client.models.list();
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

app.listen(3000, () => console.log('Server running on port 3000'));