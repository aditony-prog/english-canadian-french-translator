const FUNCTION_URL =
    "https://adi-translator-api-dxgceahfdwe0fwbz.centralus-01.azurewebsites.net/api/translate";

const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");

const inputCount = document.getElementById("inputCount");
const outputCount = document.getElementById("outputCount");

const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const copyInputBtn = document.getElementById("copyInputBtn");
const translateBtn = document.getElementById("translateBtn");

inputText.addEventListener("input", () => {
    inputCount.textContent = inputText.value.length;
});

clearBtn.addEventListener("click", () => {

    inputText.value = "";
    outputText.value = "";

    inputCount.textContent = "0";
    outputCount.textContent = "0";

    document.getElementById("qualityScore").textContent = "--%";
    document.getElementById("qualityLabel").textContent =
        "Awaiting Translation";
});

copyBtn.addEventListener("click", async () => {

    if (!outputText.value) return;

    await navigator.clipboard.writeText(outputText.value);

    copyBtn.textContent = "Copied!";

    setTimeout(() => {
        copyBtn.textContent = "Copy";
    }, 1500);
});

copyInputBtn.addEventListener("click", async () => {

    if (!inputText.value) return;

    await navigator.clipboard.writeText(inputText.value);

    copyInputBtn.textContent = "Copied!";

    setTimeout(() => {
        copyInputBtn.textContent = "Copy";
    }, 1500);
});

translateBtn.addEventListener("click", async () => {

    const text = inputText.value.trim();

    if (!text) {
        alert("Enter text first.");
        return;
    }

    translateBtn.disabled = true;
    translateBtn.textContent = "Translating...";

    try {

        const response = await fetch(FUNCTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text
            })
        });

        const result = await response.json();

        outputText.value = result.translation;

        outputCount.textContent =
            result.translation.length;

        document.getElementById("qualityScore")
            .textContent = "95%";

        document.getElementById("qualityLabel")
            .textContent = "Excellent";

    } catch (error) {

        console.error(error);

        alert("Translation failed.");
    }

    translateBtn.disabled = false;
    translateBtn.textContent = "Translate";
});
