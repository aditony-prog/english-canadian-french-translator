module.exports = async function (context, req) {

    const endpoint =
        process.env.TRANSLATOR_ENDPOINT;

    const key =
        process.env.TRANSLATOR_KEY;

    const region =
        process.env.TRANSLATOR_REGION;

    const openAiEndpoint =
        process.env.OPENAI_ENDPOINT;

    const openAiKey =
        process.env.OPENAI_KEY;

    const openAiDeployment =
        process.env.OPENAI_DEPLOYMENT;

    const text =
        req.body?.text;

    const maxLength =
        req.body?.maxLength;

    if (!text) {

        context.res = {
            status: 400,
            body: {
                error: "Text is required"
            }
        };

        return;
    }

    try {

        /*
            STEP 1
            TRANSLATE TO CANADIAN FRENCH
        */

        const translationResponse =
            await fetch(
                `${endpoint}/translate?api-version=3.0&from=en&to=fr-CA`,
                {
                    method: "POST",

                    headers: {
                        "Ocp-Apim-Subscription-Key":
                            key,

                        "Ocp-Apim-Subscription-Region":
                            region,

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify([
                        {
                            text
                        }
                    ])
                }
            );

        const translationResult =
            await translationResponse.json();

        const translation =
            translationResult[0]
                .translations[0]
                .text;

        const originalLength =
            translation.length;

        /*
            NO LIMIT PROVIDED
        */

        if (!maxLength) {

            context.res = {
                status: 200,
                body: {
                    translation,
                    optimized: false,
                    originalLength,
                    finalLength:
                        originalLength,
                    maxLength: null,
                    withinLimit: true,
                    optimizationFailed: false
                }
            };

            return;
        }

        /*
            ALREADY WITHIN LIMIT
        */

        if (
            originalLength <=
            Number(maxLength)
        ) {

            context.res = {
                status: 200,
                body: {
                    translation,
                    optimized: false,
                    originalLength,
                    finalLength:
                        originalLength,
                    maxLength:
                        Number(maxLength),
                    withinLimit: true,
                    optimizationFailed: false
                }
            };

            return;
        }

        /*
            STEP 2
            GPT-5 MINI SHORTENING
        */

        const prompt = `
Rewrite this Canadian French text.

Rules:
- Use Canadian French.
- Preserve meaning.
- Preserve product names.
- Preserve trademarks.
- Preserve company names.
- Preserve model numbers.
- Maximum ${maxLength} total characters.
- Stay at or below the character limit.
- Return ONLY the rewritten text.
- No explanations.
- No quotation marks.

Text:
${translation}
`;

        const aiResponse =
            await fetch(
                `${openAiEndpoint}/responses`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${openAiKey}`
                    },

                    body: JSON.stringify({
                        model:
                            openAiDeployment,

                        input:
                            prompt
                    })
                }
            );

        const aiResult =
            await aiResponse.json();

        context.log(
            "GPT RESPONSE:",
            JSON.stringify(
                aiResult,
                null,
                2
            )
        );

        let optimizedTranslation =
            translation;

        try {

            const messageOutput =
                aiResult.output.find(
                    item =>
                        item.type ===
                        "message"
                );

            if (
                messageOutput &&
                messageOutput.content &&
                messageOutput.content.length > 0
            ) {

                optimizedTranslation =
                    messageOutput
                        .content[0]
                        .text
                        .trim();
            }

        } catch (error) {

            console.error(
                "GPT parse error:",
                error
            );

            optimizedTranslation =
                translation;
        }

        const finalLength =
            optimizedTranslation.length;

        const withinLimit =
            finalLength <=
            Number(maxLength);

        context.res = {
            status: 200,
            body: {

                translation:
                    optimizedTranslation,

                optimized: true,

                originalLength,

                finalLength,

                maxLength:
                    Number(maxLength),

                withinLimit,

                optimizationFailed:
                    !withinLimit
            }
        };

    } catch (error) {

        console.error(error);

        context.res = {
            status: 500,
            body: {
                error:
                    error.message
            }
        };

    }
};