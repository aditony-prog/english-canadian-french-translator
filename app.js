async function translateText() {

    const text =
        document.getElementById('englishText').value;

    if (!text) {
        return;
    }

    document.getElementById('result').innerText =
        'Translator connection coming next...';

}
