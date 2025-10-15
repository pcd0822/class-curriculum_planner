// 파일 경로: netlify/functions/openai-proxy.js

exports.handler = async function(event) {
    // POST 요청만 허용합니다.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error('OpenAI API Key is not set in Netlify environment variables.');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [{ "role": "user", "content": prompt }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            return {
                statusCode: response.status,
                body: JSON.stringify({ message: `OpenAI API Error: ${errorBody.error.message}` })
            };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};
