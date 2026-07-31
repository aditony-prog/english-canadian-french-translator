module.exports = async function (context, req) {

    try {

        const response = await fetch(
            "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=fr-ca",
            {
                method: "POST",
                headers: {
                    "Ocp-Apim-Subscription-Key":
                        process.env.TRANSLATOR_KEY,

                    "Ocp-Apim-Subscription-Region":
                        process.env.TRANSLATOR_REGION,

                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify([
                    {
                        text: req.body.text
                    }
                ])
            }
        );

        const data = await response.json();

        return {
            status: 200,
            body: {
                translation:
                    data[0].translations[0].text
            }
        };

    } catch (err) {

        return {
            status: 500,
            body: {
                error: err.message
            }
        };

    }
};
