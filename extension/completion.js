function buildPrompt(message, context) {
    return `You are interacting with an app. A user will give you a request about his current webpage's text.
Here is the user's request:

${message}

[System] Please respond to the request.
[System] If you use outside information in your response, please explicitly state so.
[System] User's webpage context follows:

${context}`;
}

async function getOpenAICompletion(apiKey, message, context) {
    const aiPrompt = buildPrompt(message, context);

    try {
        const url = 'https://api.openai.com/v1/chat/completions';

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        const data = {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: aiPrompt }],
            temperature: 0.3,
            max_tokens: 256

        };

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        return response;
    } catch (error) {
        alert("Error occured while fetching OpenAI API.");
        return undefined;
    }
}

async function getGeminiCompletion(apiKey, message, context) {
    const aiPrompt = buildPrompt(message, context);

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const headers = {
            'Content-Type': 'application/json'
        };

        const body = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": aiPrompt
                        }
                    ]
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        return response;
    } catch (error) {
        alert("Error occured while fetching Gemini API.");
        return undefined;
    }
}

export { getOpenAICompletion, getGeminiCompletion };