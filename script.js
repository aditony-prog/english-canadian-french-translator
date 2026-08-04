const FUNCTION_URL =
    "https://adi-translator-api-dxgceahfdwe0fwbz.centralus-01.azurewebsites.net/api/translate";

const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");

const inputCount = document.getElementById("inputCount");

const footerOutputCount =
    document.getElementById("footerOutputCount");

const footerMaxLength =
    document.getElementById("footerMaxLength");

const footerQualityScore =
    document.getElementById("footerQualityScore");

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

const openGlossaryBtn =
    document.getElementById(
        "openGlossaryBtn"
    );

const openDntBtn =
    document.getElementById(
        "openDntBtn"
    );

const closeGlossaryBtn =
    document.getElementById(
        "closeGlossaryBtn"
    );

const closeDntBtn =
    document.getElementById(
        "closeDntBtn"
    );

const glossaryModal =
    document.getElementById(
        "glossaryModal"
    );

const dntModal =
    document.getElementById(
        "dntModal"
    );

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

    if (footerOutputCount) {
        footerOutputCount.textContent =
            "0 chars";
    }

    if (footerMaxLength) {
        footerMaxLength.textContent =
            "Unlimited";
    }

    if (footerQualityScore) {
        footerQualityScore.textContent =
            "🎯 --%";
    }

    document.getElementById(
        "tooltipGlossary"
    ).textContent =
        "--";

    document.getElementById(
        "tooltipDnt"
    ).textContent =
        "--";

    document.getElementById(
        "tooltipLength"
    ).textContent =
        "--";

    document.getElementById(
        "tooltipCompleteness"
    ).textContent =
        "--";

    document.getElementById(
        "tooltipReview"
    ).textContent =
        "--";

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
            "✓";

        setTimeout(() => {

            copyBtn.textContent =
                "⧉";

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
                "✓";

        setTimeout(() => {

            copyInputBtn.textContent =
                    "⧉";

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
                                getCharacterLimit(),
                            glossary:
                                getGlossaryTerms()
                        })
                    }
                );

            const result =
                await response.json();

            if (footerMaxLength) {

                const limit =
                    getCharacterLimit();

                footerMaxLength.textContent =
                    limit
                        ? `Max: ${limit}`
                        : "Unlimited";

            }

            outputText.value =
                result.translation;

            if (footerOutputCount) {

                footerOutputCount.textContent =
                    `${result.translation.length} chars`;

            }

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

            const translationLower =
                result.translation.toLowerCase();

            const glossaryTermsMatched =
                glossaryTermsUsed.filter(term =>
                    translationLower.includes(
                        term.target.toLowerCase()
                    )
                );

            if (glossaryTermsUsed.length > 0) {

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

            if (protectedTermsUsed.length > 0) {

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

            } else if (lengthRatio < 0.7) {

                completenessScore = 80;

            }

            const qualityScore =
                Math.round(
                    (
                        glossaryComplianceScore * 0.35 +
                        protectedTermsScore * 0.25 +
                        lengthComplianceScore * 0.20 +
                        completenessScore * 0.20
                    )
                );

            if (footerQualityScore) {

                footerQualityScore.textContent =
                    `🎯 ${qualityScore}%`;

            }

            document.getElementById(
                "tooltipGlossary"
            ).textContent =
                `${glossaryComplianceScore}%`;

            document.getElementById(
                "tooltipDnt"
            ).textContent =
                `${protectedTermsScore}%`;

            document.getElementById(
                "tooltipLength"
            ).textContent =
                `${lengthComplianceScore}%`;

            document.getElementById(
                "tooltipCompleteness"
            ).textContent =
                `${completenessScore}%`;

            document.getElementById(
                "tooltipReview"
            ).textContent =
                qualityScore < 80
                    ? "Yes"
                    : "No";

                    } catch (error) {

                        console.error(error);

                        alert("Translation failed.");

                    } finally {

                        translateBtn.disabled =
                            false;

                        translateBtn.textContent =
                            "Translate";

                    }

                }
            );

/*
    MODALS
*/

openGlossaryBtn.addEventListener(
    "click",
    () => {

        glossaryModal.classList.add(
            "active"
        );

    }
);

openDntBtn.addEventListener(
    "click",
    () => {

        dntModal.classList.add(
            "active"
        );

    }
);

closeGlossaryBtn.addEventListener(
    "click",
    () => {

        glossaryModal.classList.remove(
            "active"
        );

    }
);

closeDntBtn.addEventListener(
    "click",
    () => {

        dntModal.classList.remove(
            "active"
        );

    }
);

/*
    CLOSE ON BACKDROP CLICK
*/

glossaryModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            glossaryModal
        ) {

            glossaryModal.classList.remove(
                "active"
            );

        }

    }
);

dntModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            dntModal
        ) {

            dntModal.classList.remove(
                "active"
            );

        }

    }
);

/*
    ESC KEY CLOSE
*/

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            glossaryModal.classList.remove(
                "active"
            );

            dntModal.classList.remove(
                "active"
            );

        }

    }
);
