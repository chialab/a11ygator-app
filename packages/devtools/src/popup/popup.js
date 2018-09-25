import Reporter from '@chialab/pa11y-reporter-html';

function render(html) {
    let frame = document.getElementById('report');
    frame.innerHTML = html;
}

async function onResponse(response) {
    if (response.running) {
        render('');
    } else if (response.result) {
        let html = await Reporter.results(response.result);
        render(html);
    } else {
        render('Nothing to show.');
    }
}

chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'pa11y_report_popup') {
        onResponse(request);
    }
});

chrome.runtime.sendMessage({
    type: 'pa11y_request_popup',
}, onResponse);