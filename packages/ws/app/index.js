const missingUrlErrorMessage = (error) => `<div class="error">${error}</div>`;

sendData = async function (ev) {
    ev.preventDefault();

    const elements = document.querySelector("#site-form").elements;
    const data = {};
    for (let i = 0; i < elements.length; i++) {
        const item = elements.item(i);
        data[item.name] = item.value;
    }

    const options = data;
    const url = data.url;
    delete options.url;

    const resultContainer = document.querySelector('.result-container');

    if (!url) {
        resultContainer.innerHTML = missingUrlErrorMessage('Please insert an url.');
        return;
    }

    resultContainer.innerHTML = `<div class="loader"></div>`;

    fetch(`${document.location.origin}/?url=${url}`)
        .then(async (res) => {
            let htmlRes = await res.text();

            if (typeof htmlRes === 'string') {
                try {
                    htmlRes = JSON.parse(htmlRes);
                } catch(err) {
                    console.error(`Can't parse in HTML`);
                }
            }

            if (htmlRes.error) {
                resultContainer.innerHTML = missingUrlErrorMessage(htmlRes.error);
                return;
            }

            const parser = new DOMParser();
            const htmlDocument = parser.parseFromString(htmlRes, "text/html");
            const reportElement = htmlDocument.querySelector('.pa11y-report');
            resultContainer.innerHTML = reportElement.outerHTML;
        });
}
