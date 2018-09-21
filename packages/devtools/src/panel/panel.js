import HTMLCS_SCRIPT from 'pa11y/lib/vendor/HTMLCS';
import RUNNER_SCRIPT from 'pa11y/lib/runner';

let loaded;

async function inject(script) {
    return await new Promise((resolve, reject) => {
        chrome.devtools.inspectedWindow.eval(script, (result, error) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        })
    });
}

async function run() {
    if (!loaded) {
        await inject(`if (!window.HTMLCS) { ${HTMLCS_SCRIPT} }`);
        await inject(`if (!window._runPa11y) { ${RUNNER_SCRIPT} }`);
        loaded = true;
    }


    let res = await inject(`
        var res;
        (async () => {
            res = await _runPa11y({
                hideElements: null,
                ignore: [],
                rootElement: null,
                rules: [],
                standard: 'WCAG2AA',
                wait: 0,
            });
        })();
        res;
    `);

    while (!res) {
        res = await inject('res');
    }
    console.log(res);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request, sender, sendResponse)
    if (request.pa11y) {
        console.log(request.pa11y);
    }
});

window.addEventListener('load', () => {
    document.getElementById('run').addEventListener('click', run);
});