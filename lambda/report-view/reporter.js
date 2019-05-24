(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Reporter = factory());
}(this, (function () {
	function template(data) {
	var __t, __p = '';
	__p += '<!DOCTYPE html>\n<html lang="en">\n<head>\n	<meta charset="utf-8"/>\n    <link rel="icon" type="image/png" href="./favicon.png">\n	<title>A11ygator - Accessibility report for "' +
	((__t = ( data.documentTitle )) == null ? '' : __t) +
	'"</title>\n</head>\n<body>\n\n	<div class="pa11y-report">\n		<style>' +
	((__t = ( data.css )) == null ? '' : __t) +
	'</style>\n\n		<div class="pa11y-page">\n\n            <div tabindex="0" class="report-title-container">\n			    <h1>Accessibility report for <a href="' +
	((__t = ( data.pageUrl )) == null ? '' : __t) +
	'" target="_blank">' +
	((__t = ( data.documentTitle )) == null ? '' : __t) +
	'</a></h1>\n                <a class="download-report" aria-label="download report" href="data:text/json;charset=utf-8,' +
	((__t = ( encodeURIComponent(JSON.stringify(data)) )) == null ? '' : __t) +
	'" download="report.json">Download</a>\n            </div>\n\n			';
	 if (data.screenPath) {__p += '\n			<div class="screenshot-container">\n				<div class="buttons-container">\n					<div class="button-osx close"></div>\n					<div class="button-osx minimize"></div>\n					<div class="button-osx zoom"></div>\n				</div>\n				<img alt="a screenshot of the tested web page" class="screenshot" src="' +
	((__t = ( data.screenPath )) == null ? '' : __t) +
	'"/>\n			</div>\n			';
	 }__p += '\n\n			<ul class="results-list">\n				';

					var issues = data.issues
						.slice(0)
						.sort((issue1, issue2) => {
							if (issue1.typeCode !== issue2.typeCode) {
								return parseFloat(issue1.typeCode) - parseFloat(issue2.typeCode);
							}
							return 0;
						});

	                if (data.issues.length === 0) {__p += '\n                     <h1 tabindex="0">🎉Hurray! I have found no problems with your website. Now you are ready for a <b>real</b> accessibility test by human beings!</h1>\n                ';
	 }

					for (let i = 0; i < issues.length; i++) {
						let issue = issues[i];__p += '\n				<li tabindex="0" class="result ' +
	((__t = ( issue.type )) == null ? '' : __t) +
	'" data-selector="' +
	((__t = ( issue.selector )) == null ? '' : __t) +
	'">\n					<h2 tabindex="0" class="issue-title">' +
	((__t = ( issue.message.replace(/</g, '&lt;').replace(/>/g, '&gt;') )) == null ? '' : __t) +
	'</h2>\n					<p tabindex="0" class="issue-rule">' +
	((__t = ( issue.code.replace(/</g, '&lt;').replace(/>/g, '&gt;') )) == null ? '' : __t) +
	'</p>\n					<pre tabindex="0"class="issue-code"><code>' +
	((__t = ( (issue.context || '').replace(/</g, '&lt;').replace(/>/g, '&gt;') )) == null ? '' : __t) +
	'</code></pre>\n				</li>\n				';
	 }__p += '\n			</ul>\n			<hr />\n\n			<footer>\n				<p>Generated at: ' +
	((__t = ( data.date.toLocaleString() )) == null ? '' : __t) +
	'</p>\n				<div class="signature">\n                    <a href="https://chialab.it" target="blank" aria-label="Made with love by ChiaLab">\n                        <span>Made with ❤️ by Chialab </span>\n                        <svg class="site-header__logo" viewBox="0 0 49 31" width="64" height="40" xmlns="http://www.w3.org/2000/svg">\n                            <path d="M47 15.76h-2.62c-1.34 0-1.73-1.1-2.92-2.43s-6.6-6.42-16.28-6.42c-10.25 0-15.09 4.17-16.55 5.32-.436.39-.94.696-1.49.9-.67.21-1.25-.25-2.22-2.17C3.604 8.178 2.85 5.164 2.7 2.09 2.61.93 2.27.59 1.79.5 1.12.38.48.59.45 1.89c.08 3.633.986 7.2 2.65 10.43 1.37 2.31 1.55 2.8 1.55 3.38 0 .58-.18 1.06-1.55 3.38C1.437 22.31.53 25.877.45 29.51c0 1.31.67 1.52 1.34 1.4.49-.09.82-.43.91-1.58.15-3.068.904-6.075 2.22-8.85 1-1.92 1.55-2.34 2.22-2.13.557.234 1.063.573 1.49 1 1.46 1.16 6.3 5.48 16.55 5.48 9.67 0 15.06-4.26 16.28-5.66 1.22-1.4 1.58-1.37 2.92-1.37H47c.88 0 1.49-.18 1.49-1 0-.82-.65-1.04-1.49-1.04zm-8.43 2.63c-.33.82-5.45 4.34-13.14 4.34-9.25 0-14.6-4-16.21-5.92-.274-.285-.428-.665-.43-1.06.005-.377.16-.737.43-1 1.61-1.92 7-5.82 16.21-5.82 7.7 0 12.81 4.34 13.14 5.17.127.355.088.748-.106 1.07-.193.325-.52.544-.894.6H34c-1 0-1.52-1.28-2.25-2.19-.84-1.446-2.333-2.39-4-2.53-1.307-.046-2.576.44-3.52 1.346-.94.907-1.475 2.156-1.48 3.464.005 1.314.537 2.57 1.477 3.488.94.917 2.21 1.42 3.523 1.392 1.55.16 3.07-.51 4-1.76.488-.77 1.34-1.23 2.25-1.22h3.56c.73 0 1.25-.07.97.63h.04zm-8.28-2.69c0 1.414-1.146 2.56-2.56 2.56-1.414 0-2.56-1.146-2.56-2.56 0-1.414 1.146-2.56 2.56-2.56 1.4.022 2.525 1.16 2.53 2.56h.03z" fill="#F39200" fill-rule="evenodd">\n                            </path>\n                        </svg>\n                    </a>\n                </div>\n			</footer>\n		</div>\n	</div>\n</body>\n</html>\n';
	return __p
	}

	var templateCSS = ".pa11y-report {\n    font-family: -apple-system, BlinkMacSystemFont, \"Roboto\", \"Droid Sans\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n    font-size: 16px;\n    line-height: 22px;\n    color: #333;\n}\n\n.pa11y-report h1,\n.pa11y-report h2,\n.pa11y-report p,\n.pa11y-report pre,\n.pa11y-report ul {\n    margin-top: 0;\n    margin-bottom: 0;\n}\n\n.pa11y-report h1 {\n    margin-bottom: 1rem;\n    font-size: 1.6rem;\n    line-height: 1.2em;\n    font-weight: normal;\n}\n\n.pa11y-report h1 a {\n    color: #008cff;\n    display: inline-block;\n    text-decoration: none;\n}\n\n.pa11y-report h2 {\n    font-size: 1rem;\n    line-height: 1.4em;\n}\n\n.pa11y-report pre {\n    margin: 0;\n    padding: 0 1rem 1rem 1rem;\n    margin-top: 1rem;\n    background: rgba(255, 255, 255, 0.2);\n    border-radius: 2px;\n}\n\n.pa11y-report code {\n    display: block;\n    width: 100%;\n    padding: 1rem 0;\n    white-space: nowrap;\n    overflow: auto;\n}\n\n.pa11y-report code::-webkit-scrollbar {\n    width: 6px;\n    height: 6px;\n}\n\n.pa11y-report code::-webkit-scrollbar-thumb {\n    background: rgba(0, 0, 0, 0.5);\n    border-radius: 6px;\n}\n\n.pa11y-report code::-webkit-scrollbar-track {\n    background: transparent;\n}\n\n.pa11y-report hr {\n    border: solid 2px #e5e5e5;\n    border-width: 2px 0 0 0;\n}\n\n.pa11y-report footer {\n    display: flex;\n    flex-direction: row;\n    color: #999;\n}\n\n.pa11y-report footer > *:first-child {\n    flex: 1 auto;\n}\n\n.pa11y-report footer a {\n    color: #000;\n    text-decoration: none;\n}\n\n.pa11y-report footer a img {\n    height: 2em;\n    margin: 0 0.5em 0 0.75em;\n    vertical-align: middle;\n}\n\n.pa11y-report .pa11y-page {\n    max-width: 800px;\n    padding: 2rem 1rem;\n}\n\n.pa11y-report .issue-rule {\n    word-break: break-all;\n}\n\n.pa11y-report .results-list {\n    margin-left: 0;\n    padding-left: 0;\n    list-style: none;\n    margin-top: 1rem;\n}\n\n.pa11y-report .result {\n    padding: 1rem;\n    margin-bottom: 1rem;\n}\n\n.pa11y-report .error {\n    background-color: rgba(231, 76, 60, 0.5);\n}\n\n.pa11y-report .warning {\n    background-color: rgba(243, 156, 18, 0.5);\n}\n\n.pa11y-report .notice {\n    background-color: rgba(52, 152, 219, 0.5);\n}\n\n.pa11y-report .screenshot {\n    max-width: 100%;\n    display: block;\n}\n\n.pa11y-report .screenshot-container {\n    border: solid #d5d5d5;\n    border-width: 30px 4px 4px;\n    border-radius: 4px;\n    overflow: scroll;\n    max-height: 500px;\n    margin: 2em auto;\n    display: block;\n}\n\n.pa11y-report .buttons-container {\n    position: absolute;\n    margin-top: -24px;\n    margin-left: 5px;\n}\n\n.pa11y-report .button-osx {\n    width: 10px;\n    height: 10px;\n    display: inline-block;\n    border-radius: 10px;\n}\n\n.pa11y-report .close {\n    background: #ff5c5c;\n    border: 1px solid #e33e41;\n}\n\n.pa11y-report .minimize {\n    background: #ffbd4c;\n    border: 1px solid #e09e3e;\n}\n\n.pa11y-report .zoom {\n    background: #00ca56;\n    border: 1px solid #14ae46;\n}\n\n.report-title-container {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n}\n\n.report-title-container h1 {\n    margin: 0;\n}\n\n.download-report {\n    margin-left: 1em;\n    color: #fff;\n    padding: 0.75em 1em;\n    text-decoration: none;\n    background-color: #42513f;\n    border: 0;\n    border-radius: 2px;\n    cursor: pointer;\n    transition: all 150ms ease-out;\n}\n\n.download-report:hover {\n    background-color: #1b7bbc;\n}\n\n.signature {\n    display: flex;\n    justify-content: flex-end;\n}\n\n.signature a {\n    text-decoration: none;\n    color: black;\n    font-size: 0.75em;\n}\n\n.signature span {\n    margin-right: .5em;\n}\n\n.signature svg {\n    height: 1em;\n    width: 1.5em;\n}\n\n";

	const report = {};

	// Pa11y version support
	report.supports = '^5.0.0 || ^5.0.0-alpha || ^5.0.0-beta';

	// Compile template and output formatted results
	report.results = async results => {

	    return template({

	        css: templateCSS,

	        // The current date
	        date: new Date(),

	        // Result information
	        documentTitle: results.documentTitle,
	        issues: results.issues,
	        pageUrl: results.pageUrl,
	        screenPath: results.screenPath,

	        // Issue counts
	        errorCount: results.issues.filter(issue => issue.type === 'error').length,
	        warningCount: results.issues.filter(issue => issue.type === 'warning').length,
	        noticeCount: results.issues.filter(issue => issue.type === 'notice').length

	    });
	};

	// Output error messages
	report.error = message => {
	    return message;
	};

	return report;

})));
