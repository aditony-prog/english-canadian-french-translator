const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");

const inputCount = document.getElementById("inputCount");
const outputCount = document.getElementById("outputCount");

const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
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
    await navigator.clipboard.writeText(outputText.value);
    alert("Translation copied.");
});

translateBtn.addEventListener("click", () => {

    const text = inputText.value.trim();

    if (!text) {
        alert("Enter text first.");
        return;
    }

    // Placeholder translation until Azure is connected
    outputText.value =
        "Azure Translator will be connected in the next step.";

    outputCount.textContent = outputText.value.length;

    const quality = 95;

    document.getElementById("qualityScore").textContent =
        quality + "%";

    document.getElementById("qualityLabel").textContent =
        "Excellent";
});
