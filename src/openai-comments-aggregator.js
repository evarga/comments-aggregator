import { getComments } from "./b92-comments-extractor.js";

const openaiKey = process.env.REACT_APP_OPENAI_API_KEY;

export function isConfigured() {
    return typeof openaiKey !== 'undefined';
}

/**
 * This function takes a URL of an article's comments and returns a summary of the main points
 * and opinions expressed in the comments. It uses the OpenAI API to generate the summary.
 * It can be called as follows:
 * interpretComments(url).then((report) => {
 *    // Do something with report...
 * });
 *
 * The report object has the following properties:
 * - numComments: The number of comments analyzed.
 * - summary: The summary of the comments.
 *
 * @param url
 * @returns {Promise<{summary: *, "numComments": number}>}
 */
export async function interpretComments(url) {
    try {
        let comments = await getComments(url);
        const numComments = comments.length;
        // Make a random sample of max. 50 comments to try avoiding issues with the OpenAI API rate limit.
        comments = comments.sort(() => Math.random() - 0.5).slice(0, 50);
        let messages = comments.map((comment, _) => ({"role": "user", "content": comment}));
        messages.push({
            "role": "assistant",
            "content": "Summarize the main points and opinions of users in English returning the response in html format."
        });

        const params = {
            model: 'gpt-3.5-turbo',
            temperature: 0.3,
            frequency_penalty: 0.5,
            presence_penalty: 0.5,
            max_tokens: 1024,
            stop: '\n\n'
        };

        let response;
        for (let i = 0; i < messages.length; i += 20) {
            // Batch the messages in groups of 20 to reduce the number of requests.
            params.messages = messages.slice(i, i + 20);
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify(params)
            });
        }

        if (response.ok) {
            const openaiData = await response.json();
            return {
                "numComments": numComments,
                "summary": openaiData.choices[0]["message"]["content"]
            };
        } else if (response.status === 429)
            return {
                "numComments": 0,
                "summary": "You have hit the OpenAI API rate limit. Please try again later."
            };
        else
            console.error("Status code: " + response.status);
    } catch (error) {
        console.error(error);
    }
}
