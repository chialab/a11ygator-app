const errorMessage = (error) => `<div class="error">${error || ''}</div>`;

sendData = async function (ev) {
    ev.preventDefault();

    const data = new FormData(document.forms['site-form']);
    const url = data.get('url');
    data.delete('url');
    const options = Object.fromEntries(data.entries());

    const resultContainer = document.querySelector('.result-container');

    resultContainer.innerHTML = '<div class="loader"></div>';

    fetch(`report?url=${encodeURIComponent(url)}&format=html`, {
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
                        resultContainer.innerHTML = reportElement.outerHTML;
                    });
            }
            return res.text()
                .then((text) => {
                    resultContainer.innerHTML = errorMessage(text);
                });
        })
        .catch((err) => {
            resultContainer.innerHTML = errorMessage(err);
        });
}
