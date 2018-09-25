import 'pa11y/lib/vendor/HTMLCS';
import 'pa11y/lib/runner';

let lastResult;
let lastError;

function run() {
    window._runPa11y({
        hideElements: null,
        ignore: [],
        rootElement: null,
        rules: [],
        standard: 'WCAG2AA',
        wait: 0,
    }).then((res) => {
        lastResult = res;
        lastError = null;
        chrome.runtime.sendMessage({
            type: 'pa11y_report',
            result: lastResult,
            error: lastError,
        });
    }).catch((err) => {
        lastError = err;
        lastResult = null;
        chrome.runtime.sendMessage({
            type: 'pa11y_report',
            result: lastResult,
            error: lastError,
        });
    });
}

window.addEventListener('load', () => {
    run();

    let timeout;
    let config = { attributes: true, childList: true, subtree: true };
    let callback = function() {
        chrome.runtime.sendMessage({
            type: 'pa11y_running',
        });
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            run();
        }, 1000);
    };

    let observer = new MutationObserver(callback);
    observer.observe(document.body, config);
});