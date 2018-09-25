(() => {
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
        let callback = function(mutationsList) {
            for (let mutation of mutationsList) {
                if (mutation.target === inspector.overlay) {
                    return false;
                }
                if (mutation.addedNodes && [...mutation.addedNodes].includes(inspector.overlay)) {
                    return false;
                }
                if (mutation.removedNodes && [...mutation.removedNodes].includes(inspector.overlay)) {
                    return false;
                }
            }
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                run();
            }, 1000);
        };

        let observer = new MutationObserver(callback);
        observer.observe(document.body, config);
    });
})();