const { app } = require("@azure/functions");

app.http("translate", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        return {
            jsonBody: {
                message: "Translator API is alive"
            }
        };
    }
});
