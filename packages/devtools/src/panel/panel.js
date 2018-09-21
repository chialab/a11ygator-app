import Reporter from '@chialab/pa11y-reporter-html';
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

    const RESULT_VARIABLE = `pa11y_results_${Date.now()}`;

    let report = await inject(`
        var ${RESULT_VARIABLE} = { result: null, error: null };
        (async () => {
            try {
                ${RESULT_VARIABLE}.result = await _runPa11y({
                    hideElements: null,
                    ignore: [],
                    rootElement: null,
                    rules: [],
                    standard: 'WCAG2AA',
                    wait: 0,
                });
            } catch (error) {
                ${RESULT_VARIABLE}.error = error.mesage;
            }
        })();
    `);

    while (!report.result && !report.error) {
        report = await inject(RESULT_VARIABLE);
    }

    if (report.result) {
        let html = await Reporter.results(report.result);
        await render(html);
    }
}

async function render(html) {
    let body = html.match(/<body[^>]*>((?:.|\s)*)<\/body>/im)[1];
    let frame = document.getElementById('report');
    frame.innerHTML = body;
}

window.addEventListener('load', () => {
    document.getElementById('run').addEventListener('click', run);
});