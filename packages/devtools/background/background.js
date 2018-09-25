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
        setBadge(warningsCount, '#F39C12');
    } else if (noticesCount > 0) {
        setBadge(noticesCount, '#3498DB');
    }
}

function closePopup() {
    chrome.extension.getViews({type: 'popup'}).forEach((win) => {
        win.close()
    });
}

function checkStatus() {
    chrome.tabs.query({
        active: true,
        currentWindow: true,
    }, (tabs) => {
        if (!tabs.length) {
            return;
        }

        let tab = tabs[0];
        let id = tab.id;
        if (!tab.url) {
            chrome.browserAction.disable(id);
            return;
        }

        chrome.browserAction.enable(id);
        chrome.storage.local.get({
            standard: 'WCAG2AA',
        }, (settings) => {
            chrome.tabs.executeScript(id, {
                code: `window.pa11ySettings = ${JSON.stringify(settings)}`,
            });
            if (id in reports) {
                handleReport(reports[id]);
            }
        });
    });
}

chrome.runtime.onInstalled.addListener((details) => {
    checkStatus();
});

chrome.tabs.onActivated.addListener((info) => {
    closePopup();
    removeBadge();
    checkStatus();
});

chrome.tabs.onUpdated.addListener((info) => {
    delete reports[info];
    closePopup();
    removeBadge();
    checkStatus();
});

chrome.tabs.onRemoved.addListener((info) => {
    delete reports[info];
    closePopup();
    removeBadge();
    checkStatus();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    chrome.tabs.query({
        active: true,
        currentWindow: true,
    }, (tabs) => {
        if (!tabs.length) {
            return;
        }

        let id = tabs[0].id;

        if (request.type === 'pa11y_report') {
            let report = {
                result: request.result,
                error: request.error,
            };
            reports[id] = report;
            handleReport(report);
        } else if (request.type === 'pa11y_request') {
            sendResponse(reports[id]);
            if (!(id in reports)) {
                chrome.storage.local.get({
                    standard: 'WCAG2AA',
                }, (settings) => {
                    chrome.tabs.executeScript(id, {
                        code: `window.pa11ySettings = ${JSON.stringify(settings)}`,
                    });

                    [
                        'vendors/HTMLCS.js',
                        'vendors/pa11y.runner.js',
                        'content/inspector.js',
                        'content/runner.js',
                    ].forEach((file) => {
                        chrome.tabs.executeScript(id, {
                            file: file,
                        });
                    });
                });
            }
        }
    });
    return true;
});

chrome.extension.onConnect.addListener((port) => {
    if (port.name === 'popup') {
        port.onDisconnect.addListener(() => {
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
        });
    }
});
