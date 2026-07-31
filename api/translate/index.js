module.exports = async function (context, req) {

    const endpoint = process.env.TRANSLATOR_ENDPOINT;
    const key = process.env.TRANSLATOR_KEY;
    const region = process.env.TRANSLATOR_REGION;

    const { text, from, to } = req.body;

    try {

        const response = await fetch(
            `${endpoint}/translate?api-version=3.0&from=${from}&to=${to}`,
            {
                method: "POST",
                headers: {
                    "Ocp-Apim-Subscription-Key": key,
                    "Ocp-Apim-Subscription-Region": region,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify([
                    {
                        text: text
                    }
                ])
            }
        );

        const result = await response.json();

        context.res = {
            status: 200,
            body: result
        };

    } catch (error) {

        context.res = {
            status: 500,
            body: {
                error: error.message
            }
        };

    }
};
