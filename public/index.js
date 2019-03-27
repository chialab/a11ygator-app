const errorMessage = (error) => `<div class="error">${error || ''}</div>`;

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

    resultContainer.innerHTML = '<div class="loader"></div>';

    fetch(`report?url=${url}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(options),
    })
        .then((res) => {
            if (res.ok) {
                return res.text()
                    .then((htmlRes) => {
                        const parser = new DOMParser();
                        const htmlDocument = parser.parseFromString(htmlRes, "text/html");
                        const reportElement = htmlDocument.querySelector('.pa11y-report');
                    });
            }
            res.text().then((text) => {
                resultContainer.innerHTML = errorMessage(text);
            });
        })
        .catch((err) => {
            resultContainer.innerHTML = errorMessage(err);
        });
}
