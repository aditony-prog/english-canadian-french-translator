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

function getProtectedTerms() {
    const field = document.getElementById("protectedTerms");

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
        const escaped = term.replace(
            /[.*+?^${}()|[\]\\]/g,
          * "\\$&"
        );

        const *egex = new RegExp(escaped, "gi");
*        updatedText = updatedText.*eplace(
            regex,
       *    match =>
                `<mst*ans:dictionary translation="${matc*}">${match}</mstrans:dictionary>`
*       );
    });

    return upda*edText;
}

inputText.addEventListe*er("input", () => {
    inputCount*textContent = inputText.value.leng*h;
});

clearBtn.addEventListener(*click", () => {
    inputText.valu* = "";
    outputText.value = "";
*    inputCount.textContent = "0";
*   outputCount.textContent = "0";
*    document.getElementById("quali*yScore").textContent = "--%";
    *ocument.getElementById("qualityLab*l").textContent =
        "Awaitin* Translation";
});

copyBtn.addEve*tListener("click", async () => {
 *  if (!outputText.value) return;

*   await navigator.clipboard.write*ext(outputText.value);

    copyBt*.textContent = "Copied!";

    set*imeout(() => {
        copyBtn.tex*Content = "Copy";
    }, 1500);
})*

copyInputBtn.addEventListener("c*ick", async () => {
    if (!input*ext.value) return;

    await navi*ator.clipboard.writeText(inputText*value);

    copyInputBtn.textCont*nt = "Copied!";

    setTimeout(()*=> {
        copyInputBtn.textCont*nt = "Copy";
    }, 1500);
});

tr*nslateBtn.addEventListener("click"* async () => {

    const text = i*putText.value.trim();

    if (!te*t) {
        alert("Enter text fir*t.");
        return;
    }

    c*nst protectedTerms = getProtectedT*rms();

    const processedText =
*       applyDictionaryMarkup(
    *       text,
            protected*erms
        );

    console.log("*rotected Terms:", protectedTerms);*    console.log("Processed Text:",*processedText);

    translateBtn.*isabled = true;
    translateBtn.t*xtContent = "Translating...";

    try {

        const response = await fetch(FUNCTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: processedText
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
