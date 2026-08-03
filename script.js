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

const glossaryTermsField =
    document.getElementById("glossaryTerms");

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

function getGlossaryTerms() {

    if (!glossaryTermsField) {
        return [];
    }

    return glossaryTermsField.value
        .trim()
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.includes("="))
        .map(line => {

            const parts =
                line.split("=");

            return {
                source:
                    parts[0].trim(),

                target:
                    parts[1].trim()
            };

        });

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
    SAVE GLOSSARY TERMS
*/

if (glossaryTermsField) {

    glossaryTermsField.addEventListener(
        "input",
        () => {

            localStorage.setItem(
                "adiGlossaryTerms",
                glossaryTermsField.value
            );

        }
    );

}

/*
    RESTORE SAVED DATA
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

    const savedGlossary =
        localStorage.getItem(
            "adiGlossaryTerms"
        );

    if (
        glossaryTermsField &&
        savedGlossary
    ) {

        glossaryTermsField.value =
            savedGlossary;

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

    document.getElementById(
    "glossaryComplianceScore"
    ).textContent =
    "--";

    document.getElementById(
        "protectedTermsScore"
    ).textContent = "--";

    document.getElementById(
        "lengthComplianceScore"
    ).textContent = "--";

    document.getElementById(
        "completenessScore"
    ).textContent = "--";

    document.getElementById(
        "reviewRequired"
    ).textContent = "--";

    const qualityBar =
        document.querySelector(
            ".quality-bar-fill"
        );

    if (qualityBar) {

        qualityBar.style.width =
            "0%";

    }

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
                QUALITY DASHBOARD
            */

            let glossaryComplianceScore = 100;
            let protectedTermsScore = 100;
            let lengthComplianceScore = 100;
            let completenessScore = 100;

            const glossaryTerms =
                getGlossaryTerms();

            const glossaryTermsUsed =
                glossaryTerms.filter(term =>
                    text.includes(term.source)
                );

            const glossaryTermsMatched =
                glossaryTermsUsed.filter(term =>
                    result.translation.includes(
                        term.target
                    )
                );

            if (
                glossaryTermsUsed.length > 0
            ) {

                glossaryComplianceScore =
                    Math.round(
                        (
                            glossaryTermsMatched.length /
                            glossaryTermsUsed.length
                        ) * 100
                    );
            
            }

            const protectedTermsUsed =
                protectedTerms.filter(term =>
                    text.includes(term)
                );

            const protectedTermsPreserved =
                protectedTermsUsed.filter(term =>
                    result.translation.includes(term)
                );

            if (
                protectedTermsUsed.length > 0
            ) {

                protectedTermsScore =
                    Math.round(
                        (
                            protectedTermsPreserved.length /
                            protectedTermsUsed.length
                        ) * 100
                    );

            }

            if (
                result.maxLength &&
                !result.withinLimit
            ) {

                lengthComplianceScore = 50;

            }

            const sourceLength =
                text.length;

            const translatedLength =
                result.translation.length;

            const lengthRatio =
                translatedLength /
                sourceLength;

            if (lengthRatio < 0.5) {

                completenessScore = 60;

            } else if (
                lengthRatio < 0.7
            ) {

                completenessScore = 80;

            }

            const qualityScore =
                Math.round(
                    (
                        protectedTermsScore * 0.4 +
                        lengthComplianceScore * 0.3 +
                        completenessScore * 0.3
                    )
                );

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

            document.getElementById(
                "protectedTermsScore"
            ).textContent =
                `${protectedTermsScore}%`;

            document.getElementById(
                "lengthComplianceScore"
            ).textContent =
                `${lengthComplianceScore}%`;

            document.getElementById(
                "completenessScore"
            ).textContent =
                `${completenessScore}%`;

            document.getElementById(
                "reviewRequired"
            ).textContent =
                qualityScore < 80
                    ? "Yes"
                    : "No";

            const qualityBar =
                document.querySelector(
                    ".quality-bar-fill"
                );

            if (qualityBar) {

                qualityBar.style.width =
                    `${qualityScore}%`;

            }

            let statusMessage =
                qualityRating;

            if (
                result.optimized
            ) {

                statusMessage =
                    `${qualityRating} • Optimized from ${result.originalLength} to ${result.finalLength} characters`;

            } else if (
                result.maxLength &&
                result.withinLimit
            ) {

                statusMessage =
                    `${qualityRating} • Within ${result.maxLength}-character limit`;

            }

            document.getElementById(
                "qualityLabel"
            ).textContent =
                statusMessage;

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
