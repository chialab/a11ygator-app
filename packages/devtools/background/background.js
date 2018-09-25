let reports = {};

function removeBadge() {
    chrome.browserAction.setBadgeText({ text: '' });
}

function setBadge(number, color) {
    chrome.browserAction.setBadgeBackgroundColor({ color: color });
    chrome.browserAction.setBadgeText({ text: `${number}` });
}

function handleReport(report) {
    if (!report || !report.result) {
        return removeBadge();
    }
    let errorsCount = 0;
    let warningsCount = 0;
    let noticesCount = 0;
    report.result.issues.forEach((issue) => {
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

function closePopup() {
    chrome.extension.getViews({type: 'popup'}).forEach((win) => {
        win.close()
    });
}

chrome.tabs.onActivated.addListener((info) => {
    closePopup();
    handleReport(reports[info.tabId]);
});

chrome.tabs.onUpdated.addListener((info) => {
    closePopup();
    removeBadge();
    delete reports[info.tabId];
});

chrome.tabs.onRemoved.addListener((info) => {
    removeBadge();
    delete reports[info.tabId];
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    chrome.tabs.query({
        active: true,
        currentWindow: true,
    }, (tabs) => {
        if (!tabs.length) {
            return;
        }
        if (request.type === 'pa11y_report') {
            let report = {
                result: request.result,
                error: request.error,
            };
            reports[tabs[0].id] = report;
            handleReport(report);
            chrome.runtime.sendMessage({
                type: 'pa11y_report_popup',
                result: report.result,
                error: report.error,
            });
        } else if (request.type === 'pa11y_request_popup') {
            sendResponse(reports[tabs[0].id] || {});
        }
    });
    return true;
});
