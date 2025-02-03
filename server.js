const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
    const { message } = req.body;

    if(!message){
        return res.status(400).send({ error: 'Message is required' });
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: message }],
                max_tokens: 150,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        console.log(response.data);
        const rateLimitRemaining = response.headers['x-ratelimit-remaining'];
        const rateLimitReset = response.headers['x-ratelimit-reset'];
        
        console.log(`Remaining Requests: ${rateLimitRemaining}`);
        console.log(`Rate Limit Reset Time: ${new Date(rateLimitReset * 1000).toLocaleString()}`);
        if(response.data && response.data.choices && response.data.choices[0]){
            res.send({ reply: response.data.choices[0].message.content.trim() });
        } else {
            res.status(500).send({ error: 'No valid response from OpenAI' });
        }
        
    } catch (error) {
        console.log('Error with OpenAI API:', error);
        res.status(500).send({ error: 'Failed to fetch AI response' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})