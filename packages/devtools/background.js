let report = {};
let running = false;

function removeBadge() {
    chrome.browserAction.setBadgeText({ text: '' });
}

function setBadge(number, color) {
    chrome.browserAction.setBadgeBackgroundColor({ color: color });
    chrome.browserAction.setBadgeText({ text: `${number}` });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
    removeBadge();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'pa11y_report') {
        running = false;
        report = {
            result: request.result,
            error: request.error,
        };
        if (request.error) {
            removeBadge();
        } else if (request.result && request.result.issues) {
            let errorsCount = 0;
            let warningsCount = 0;
            let noticesCount = 0;
            request.result.issues.forEach((issue) => {
                switch (issue.type) {
                    case 'error':
                        errorsCount++;
                        break;
                    case 'warning':
                        warningsCount++;
                        break;
                    default:
                        noticesCount++;
                }
            });

            if (errorsCount > 0) {
                setBadge(errorsCount, '#E74C3C');
            } else if (warningsCount > 0) {
                setBadge(errorsCount, '#F39C12');
            } else if (noticesCount > 0) {
                setBadge(errorsCount, '#3498DB');
            }
        }
        chrome.runtime.sendMessage({
            type: 'pa11y_report_popup',
            result: report.result,
            error: report.error,
            running: running,
        });
    } else if (request.type === 'pa11y_request_popup') {
        sendResponse({
            result: report.result,
            error: report.error,
            running: running,
        });
    } else if (request.type === 'pa11y_running') {
        running = true;
        chrome.runtime.sendMessage({
            type: 'pa11y_report_popup',
            result: report.result,
            error: report.error,
            running: running,
        });
    }
    return true;
});
