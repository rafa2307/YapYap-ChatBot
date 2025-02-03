const express = require('express'); // A lightweight web framework for handling HTTP requests.
const cors = require('cors'); // Allows requests from different domains (important for frontend-backend communication).
const dotenv = require('dotenv'); // Loads environment variables from a .env file.
const axios = require('axios'); // Used for making HTTP requests (to call OpenAI’s API).

const app = express(); // Creates an Express application.

dotenv.config(); // Loads API keys and other secrets from .env.

app.use(cors()); // Enables Cross-Origin Resource Sharing so frontend apps can communicate with this backend.
app.use(express.json()); // Ensures the server can parse JSON data from incoming requests.

app.post('/chat', async (req, res) => {
    const { message } = req.body;

    // This checks if the message is empty
    if(!message){
        return res.status(400).send({ error: 'Message is required' });
    }

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: message }],
                max_tokens: 150, // this limits the AI's response length
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json', // tells the API the request is in JSON format
                }
            }
        );
        console.log(response.data);
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