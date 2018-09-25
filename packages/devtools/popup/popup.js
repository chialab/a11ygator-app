const frame = document.getElementById('report');

let lastReport;

function render(html) {
    document.body.removeAttribute('refreshable');
    if (frame.innerHTML !== html) {
        frame.innerHTML = html;
    }
    window.scroll(0, 0);
}

async function onResponse(response) {
    if (!response) {
        return;
    }
    if (response.result) {
        let counts = {
            errorCount: response.result.issues.filter(issue => issue.type === 'error').length,
            warningCount: response.result.issues.filter(issue => issue.type === 'warning').length,
            noticeCount: response.result.issues.filter(issue => issue.type === 'notice').length
        };

        document.querySelector('button[value="errors"]').setAttribute('data-count', counts.errorCount);
        if (!counts.errorCount) {
            document.querySelector('button[value="errors"]').setAttribute('disabled', '');
        } else {
            document.querySelector('button[value="errors"]').removeAttribute('disabled');
        }
        document.querySelector('button[value="warnings"]').setAttribute('data-count', counts.warningCount);
        if (!counts.warningCount) {
            document.querySelector('button[value="warnings"]').setAttribute('disabled', '');
        } else {
            document.querySelector('button[value="warnings"]').removeAttribute('disabled');
        }
        document.querySelector('button[value="notices"]').setAttribute('data-count', counts.noticeCount);
        if (!counts.noticeCount) {
            document.querySelector('button[value="notices"]').setAttribute('disabled', '');
        } else {
            document.querySelector('button[value="notices"]').removeAttribute('disabled');
        }

        let html = await Reporter.results(response.result);
        render(html);
    } else {
        render('<p>Nothing to show.</p>');
    }
}

chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'pa11y_report') {
        if (!lastReport) {
            onResponse(request);
        }
        lastReport = request;
        document.body.setAttribute('refreshable', '');
    }
});

chrome.runtime.sendMessage({
    type: 'pa11y_request',
}, onResponse);

document.addEventListener('mouseover', (event) => {
    if (event.target.closest('[data-selector]')) {
        let item = event.target.closest('[data-selector]');
        let selector = item.getAttribute('data-selector');
        chrome.tabs.query({
            active: true,
            currentWindow: true,
        }, (tabs) => {
            chrome.tabs.executeScript(tabs[0].id,{
                code: `inspector.inspect('${selector}');`,
            });
        });
    } else {
        chrome.tabs.query({
            active: true,
            currentWindow: true,
        }, (tabs) => {
            chrome.tabs.executeScript(
                tabs[0].id,
                {
                    code: `inspector.clear();`,
                }
            );
        });
    }
});

document.querySelector('.refreshbar button').addEventListener('click', () => {
    onResponse(lastReport);
});

document.querySelectorAll('nav button').forEach((button) => {
    button.addEventListener('click', () => {
        document.body.classList.remove('filter-errors', 'filter-warnings', 'filter-notices');

        if (button.value) {
            document.body.classList.add(`filter-${button.value}`);
        }
    });
});

chrome.extension.connect({
    name: 'popup',
});