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
    resultContainer.innerHTML = 'Loading';

    const htmlRes = await fetch(`${document.location.origin}/?url=${url}`).then((res) => res.text());
    console.log(htmlRes)
    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(htmlRes, "text/html");
    console.log(htmlDocument)
    const reportElement = htmlDocument.querySelector('.pa11y-report');
    resultContainer.innerHTML = reportElement.outerHTML;
}
