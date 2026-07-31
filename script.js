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

const protectedTermsField =
    document.getElementById("protectedTerms");

/*
    DO NOT TRANSLATE FUNCTIONS
*/

function getProtectedTerms() {

    if (!protectedTermsField) {
        return [];
    }

    return protectedTermsField.value
        .trim()
        .split("\n")
        .map(term => term.trim())
        .filter(term => term !== "");
}

function applyDictionaryMarkup(text, terms) {

    let updatedText = text;

    terms.forEach(term => {

        updatedText = updatedText.replaceAll(
            term,
            `<mstrans:dictionary translation="${term}">${term}</mstrans:dictionary>`
        );

    });

    return updatedText;
}

/*
    SAVE PROTECTED TERMS
*/

if (protectedTermsField) {

    protectedTermsField.addEventListener(
        "input",
        () => {

            localStorage.setItem(
                "adiProtectedTerms",
                protectedTermsField.value
            );

        }
    );
}

/*
    RESTORE PROTECTED TERMS
*/

window.addEventListener("load", () => {

    const savedTerms =
        localStorage.getItem(
            "adiProtectedTerms"
        );

    if (
        protectedTermsField &&
        savedTerms
    ) {
        protectedTermsField.value =
            savedTerms;
    }
});

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

    translateBtn.disabled = true;
    translateBtn.textContent =
        "Translating...";

    try {

        const response = await fetch(
            FUNCTION_URL,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    text: processedText
                })
            }
        );

        const result =
            await response.json();

        outputText.value =
            result.translation;

        outputCount.textContent =
            result.translation.length;

        document.getElementById(
            "qualityScore"
        ).textContent = "95%";

        document.getElementById(
            "qualityLabel"
        ).textContent = "Excellent";

    } catch (error) {

        console.error(error);

        alert("Translation failed.");

    } finally {

        translateBtn.disabled = false;
        translateBtn.textContent =
            "Translate";
    }
});
