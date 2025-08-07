const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname))); // Serve static files (like index.html)

// The secure API endpoint
app.post('https://resumetowebsite.onrender.com/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    // Access the key securely from environment variables set in your hosting provider (like Render)
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
      // This error will show in your server logs if the key is missing
      return res.status(500).json({ error: "API key is not set on the server." });
    }

    // Using a fast model to avoid timeouts
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    // Using 'node-fetch' or a similar library is recommended for robustness in Node.js
    // For simplicity, we'll use the built-in fetch if your Node version supports it (v18+)
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error("Gemini API Error:", errorData);
      return res.status(geminiResponse.status).json({ error: "Failed to fetch from Gemini API." });
    }

    const data = await geminiResponse.json();
    res.status(200).json(data);

  } catch (error) {
    console.error("Server Function Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the main index.html file for any other GET request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
