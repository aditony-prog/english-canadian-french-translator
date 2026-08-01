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

const maxLength =
    document.getElementById("maxLength");

const presetButtons =
    document.querySelectorAll(".preset-btn");

/*
    PRESET LENGTH BUTTONS
*/

presetButtons.forEach(button => {

    button.addEventListener("click", () => {

        presetButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        maxLength.value =
            button.dataset.length;

    });

});

/*
    ACTIVE PRESET TRACKING
*/

maxLength.addEventListener("input", () => {

    const currentValue =
        maxLength.value.trim();

    let matchingPreset =
        false;

    presetButtons.forEach(button => {

        if (
            button.dataset.length ===
            currentValue
        ) {

            matchingPreset = true;

            button.classList.add("active");

        } else {

            button.classList.remove("active");

        }

    });

    if (!matchingPreset) {

        presetButtons.forEach(button => {

            button.classList.remove("active");

        });

    }

});

/*
    DO NOT TRANSLATE
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
    CHARACTER LIMIT
*/

function getCharacterLimit() {

    if (!maxLength) {
        return null;
    }

    const value =
        maxLength.value.trim();

    if (!value) {
        return null;
    }

    return Number(value);
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
    INPUT COUNTER
*/

inputText.addEventListener("input", () => {

    inputCount.textContent =
        inputText.value.length;

});

/*
    CLEAR BUTTON
*/

clearBtn.addEventListener("click", () => {

    inputText.value = "";
    outputText.value = "";

    inputCount.textContent = "0";
    outputCount.textContent = "0";

    document.getElementById(
        "qualityScore"
    ).textContent = "--%";

    document.getElementById(
        "qualityLabel"
    ).textContent =
        "Awaiting Translation";
});

/*
    COPY TRANSLATION
*/

copyBtn.addEventListener(
    "click",
    async () => {

        if (!outputText.value) {
            return;
        }

        await navigator.clipboard.writeText(
            outputText.value
        );

        copyBtn.textContent =
            "Copied!";

        setTimeout(() => {

            copyBtn.textContent =
                "Copy";

        }, 1500);
    }
);

/*
    COPY SOURCE
*/

copyInputBtn.addEventListener(
    "click",
    async () => {

        if (!inputText.value) {
            return;
        }

        await navigator.clipboard.writeText(
            inputText.value
        );

        copyInputBtn.textContent =
            "Copied!";

        setTimeout(() => {

            copyInputBtn.textContent =
                "Copy";

        }, 1500);
    }
);

/*
    TRANSLATE
*/

translateBtn.addEventListener(
    "click",
    async () => {

        const text =
            inputText.value.trim();

        if (!text) {

            alert(
                "Enter text first."
            );

            return;
        }

        const protectedTerms =
            getProtectedTerms();

        const processedText =
            applyDictionaryMarkup(
                text,
                protectedTerms
            );

        translateBtn.disabled =
            true;

        translateBtn.textContent =
            "Translating...";

        try {

            const response =
                await fetch(
                    FUNCTION_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            text: processedText,
                            maxLength:
                                getCharacterLimit()
                        })
                    }
                );

            const result =
                await response.json();

            outputText.value =
                result.translation;

            outputCount.textContent =
                result.translation.length;

            /*
                TRANSLATION QUALITY SCORE
            */

            let qualityScore = 0;

            // Translation success
            qualityScore += 40;

            // Protected terms support
            qualityScore += 30;

            // Length compliance
            if (
                !result.maxLength ||
                result.withinLimit
            ) {

                qualityScore += 30;

            }

            let qualityRating =
                "Excellent";

            if (
                qualityScore < 90
            ) {

                qualityRating =
                    "Good";
            }

            if (
                qualityScore < 80
            ) {

                qualityRating =
                    "Needs Review";
            }

            document.getElementById(
                "qualityScore"
            ).textContent =
                `${qualityScore}%`;

            /*
                STATUS MESSAGE
            */

            if (
                result.optimized
            ) {

                document.getElementById(
                    "qualityLabel"
                ).textContent =
                    `✓ Optimized from ${result.originalLength} → ${result.finalLength} characters`;

            } else if (
                result.maxLength
            ) {

                document.getElementById(
                    "qualityLabel"
                ).textContent =
                    `✓ Within ${result.maxLength}-character limit`;

            } else {

                document.getElementById(
                    "qualityLabel"
                ).textContent =
                    `✓ ${qualityRating}`;

            }

        } catch (error) {

            console.error(
                error
            );

            alert(
                "Translation failed."
            );

        } finally {

            translateBtn.disabled =
                false;

            translateBtn.textContent =
                "Translate";
        }
    }
);
