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

    document.querySelector('.result-container').innerHTML = 'Loading';

    const res = await fetch(`${document.location.origin}/?url=${url}`);
    res.json()
        .then((json) => {
            document.querySelector('.result-container').innerHTML = JSON.stringify(json);
        })
}
