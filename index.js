require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

app.post('/chat', async (req, res) => {
    try {
        console.log("✅ Incoming request:", req.body); // Log request

        const response = await axios.post(DEEPSEEK_API_URL, {
            model: 'deepseek/deepseek-r1',  // Correct


            messages: [{ role: 'user', content: req.body.message }]
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("✅ API Response:", response.data); // Log API response
        res.json(response.data);
    } catch (error) {
        console.error("❌ DeepSeek API Error:", error.response ? error.response.data : error.message); // Log error
        res.status(500).json({ error: error.response ? error.response.data : "Something went wrong" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
