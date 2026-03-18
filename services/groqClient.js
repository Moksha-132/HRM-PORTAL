const https = require('https');

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

function callGroqChat({ systemPrompt, userMessage }) {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.GROQ_API;
        if (!apiKey) {
            return reject(new Error('GROQ_API key is not configured'));
        }

        const payload = JSON.stringify({
            model: DEFAULT_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            temperature: 0.7
        });

        const options = {
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const content = json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content;
                    if (!content) {
                        return reject(new Error('Groq response missing content'));
                    }
                    resolve(content.trim());
                } catch (err) {
                    reject(err);
                }
            });
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

module.exports = { callGroqChat };
