import Reporter from '@chialab/pa11y-reporter-html';

async function render(html) {
    let frame = document.getElementById('report');
    frame.innerHTML = html;
}

async function highlight(selector) {
    await inject(`inspect($('${selector}'))`);
}

document.addEventListener('click', async (ev) => {
    if (ev.target.closest('[data-selector]')) {
        await highlight(ev.target.closest('[data-selector]').getAttribute('data-selector'));
    }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === 'pa11y_report_popup') {
        if (request.result) {
            let html = await Reporter.results(request.result);
            await render(html);
        } else {
            await render('Nothing to show.');
        }
    }
});

chrome.runtime.sendMessage({
    type: 'pa11y_request_popup',
});