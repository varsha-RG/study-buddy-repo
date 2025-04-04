require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Sentiment = require('sentiment');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));

const sentiment = new Sentiment();
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 🎭 New Expanded Mood Responses
const moodResponses = {
    "sad": [
        "It's okay to feel sad. Just know that this feeling is temporary, and brighter days are ahead. 💙",
        "Sadness is a part of being human, but you are never alone. Want to talk about it?",
        "I’m here for you. Maybe a warm drink, soft music, or a cozy blanket could help. 💛"
    ],
    "lonely": [
        "You’re never truly alone. I'm right here with you. 💙",
        "Loneliness can be tough, but even a small chat with a friend or a walk outside can help. 💜",
        "Want a fun fact to distract you? 😊"
    ],
    "anxious": [
        "Breathe in... hold... exhale slowly. You got this. 🌿",
        "Let’s shift focus: Can you name 3 things you see right now? Grounding helps ease anxiety. 🌸",
        "Try writing down what's making you anxious—getting it out can lighten the load. 💙"
    ],
    "stressed": [
        "Stress is just a sign that you care. But don’t forget to care for yourself too. Try a 2-minute break? 🌿",
        "Let's take it one step at a time. What’s the biggest thing on your mind?",
        "Deep breath in… and out. You’re handling more than you realize. 💛"
    ],
    "fear": [
        "Fear is just your mind preparing for something. You've overcome challenges before, and you’ll do it again. 💪",
        "Courage isn’t the absence of fear—it’s moving forward despite it. You got this. 🌟",
        "Whatever is worrying you, you’re not facing it alone. I believe in you. 💙"
    ],
    "frustrated": [
        "Ugh, that sounds frustrating. Want to vent? I’m all ears. 🔥",
        "Sometimes frustration means you're close to a breakthrough. Hang in there!",
        "Punch a pillow, go for a walk, or just scream into the void. Whatever helps, I support you. 😤"
    ],
    "motivated": [
        "YESSS, I love this energy! Keep pushing forward! 💪🔥",
        "You're on fire! Keep that momentum going—nothing can stop you. 🚀",
        "The world better watch out because YOU are unstoppable today. 😎"
    ],
    "happy": [
        "I LOVE hearing that! Spread that happiness around! 🎉💖",
        "Yesss! Happiness looks great on you. Keep shining! ☀️",
        "That’s awesome! What made you happy today? 😊"
    ],
    "excited": [
        "Ooooh, tell me more! I love hearing excitement! 🎉",
        "YESSS, this is the energy I love! What’s got you hyped? 🔥",
        "Excitement is contagious, and I’m catching it! Let’s gooo! 🚀"
    ],
    "confident": [
        "Look at you, radiating confidence! The world better take notes. 😎",
        "I love this! Keep that head high and own your greatness. 👑",
        "Confidence looks good on you! Keep slaying. 🔥"
    ],
    "tired": [
        "Rest is productive too. Take a short break—you deserve it. 🌙",
        "Tired means you’ve been working hard. Don’t forget to recharge. ⚡",
        "Maybe a power nap or a deep breath will help? Your energy will return soon. 🌿"
    ]
};

// ✨ Get random response from moodResponses
const getRandomResponse = (mood) => {
    return moodResponses[mood] ? moodResponses[mood][Math.floor(Math.random() * moodResponses[mood].length)] : null;
};

app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message.toLowerCase();

        // 1️⃣ **Analyze sentiment**
        const result = sentiment.analyze(userMessage);
        const score = result.score;

        // 2️⃣ **Detect Mood from Keywords**
        let detectedMood = 'neutral';
        for (const mood in moodResponses) {
            if (userMessage.includes(mood)) {
                detectedMood = mood;
                break;
            }
        }

        // 3️⃣ **Send FAST PREDEFINED RESPONSE if mood is detected**
        const customResponse = getRandomResponse(detectedMood);
        if (customResponse) {
            return res.json({ message: customResponse });
        }

        // 4️⃣ **Default system prompt**
        const systemPrompt = `You're a helpful assistant. The user seems ${detectedMood}. Respond appropriately.`;

        // 5️⃣ **Call DeepSeek API for any other messages**
        const response = await axios.post(DEEPSEEK_API_URL, {
            model: 'deepseek/deepseek-r1',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: req.body.message }
            ],
            max_tokens: 1000
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);

    } catch (error) {
        console.error("❌ DeepSeek API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Something went wrong" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
