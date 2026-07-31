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

/*
    DO NOT TRANSLATE FUNCTIONS
*/

function getProtectedTerms() {

    const field =
        document.getElementById("protectedTerms");

    if (!field) {
        return [];
    }

    return field.value
        .split("\n")
        .map(term => term.trim())
        .filter(term => term.length > 0);
}

function applyDictionaryMarkup(text, terms) {

    let updatedText = text;

    terms.forEach(term => {

        const escaped =
            term.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

        const regex =
            new RegExp(escaped, "gi");

        updatedText =
            updatedText.replace(
                regex,
                match =>
                    `<mstrans:dictionary translation="${match}">${match}</mstrans:dictionary>`
            );
    });

    return updatedText;
}

/*
    CHARACTER COUNTER
*/

inputText.addEventListener("input", () => {
    inputCount.textContent = inputText.value.length;
});

/*
    CLEAR BUTTON
*/

clearBtn.addEventListener("click", () => {

    inputText.value = "";
    outputText.value = "";

    inputCount.textContent = "0";
    outputCount.textContent = "0";

    document.getElementById("qualityScore").textContent = "--%";

    document.getElementById("qualityLabel").textContent =
        "Awaiting Translation";
});

/*
    COPY TRANSLATION
*/

copyBtn.addEventListener("click", async () => {

    if (!outputText.value) return;

    await navigator.clipboard.writeText(
        outputText.value
    );

    copyBtn.textContent = "Copied!";

    setTimeout(() => {
        copyBtn.textContent = "Copy";
    }, 1500);
});

/*
    COPY SOURCE TEXT
*/

copyInputBtn.addEventListener("click", async () => {

    if (!inputText.value) return;

    await navigator.clipboard.writeText(
        inputText.value
    );

    copyInputBtn.textContent = "Copied!";

    setTimeout(() => {
        copyInputBtn.textContent = "Copy";
    }, 1500);
});

/*
    TRANSLATE
*/

translateBtn.addEventListener("click", async () => {

    const text = inputText.value.trim();

    if (!text) {
        alert("Enter text first.");
        return;
    }

    const protectedTerms =
        getProtectedTerms();

    const processedText =
        applyDictionaryMarkup(
            text,
            protectedTerms
        );

    console.log(
        "Protected Terms:",
        protectedTerms
    );

    console.log(
        "Processed Text:",
        processedText
    );

    translateBtn.disabled = true;
    translateBtn.textContent =
        "Translating...";

    try {

        const response = await fetch(
            FUNCTION_URL,
            {
                method: "POST",
                headers: {
        
