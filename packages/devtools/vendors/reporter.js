(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Reporter = factory());
}(this, (function () {
	function template(data) {
	var __t, __p = '';
	__p += '<!DOCTYPE html>\n<html lang="en">\n<head>\n\n	<meta charset="utf-8"/>\n	<title>Accessibility report for "' +
	((__t = ( data.documentTitle )) == null ? '' : __t) +
	'"</title>\n\n</head>\n<body>\n\n	<div class="pa11y-report">\n		<style>' +
	((__t = ( data.css )) == null ? '' : __t) +
	'</style>\n\n		<div class="pa11y-page">\n\n			<h1>Accessibility report for <a href="' +
	((__t = ( data.pageUrl )) == null ? '' : __t) +
	'" target="_blank">' +
	((__t = ( data.documentTitle )) == null ? '' : __t) +
	'</a></h1>\n\n			';
	 if (data.screenPath) {__p += '\n			<div class="screenshot-container">\n				<div class="buttons-container">\n					<div class="button-osx close"></div>\n					<div class="button-osx minimize"></div>\n					<div class="button-osx zoom"></div>\n				</div>\n				<img class="screenshot" src="' +
	((__t = ( data.screenPath )) == null ? '' : __t) +
	'"/>\n			</div>\n			';
	 }__p += '\n\n			<ul class="clean-list results-list">\n				';

					var issues = data.issues
						.slice(0)
						.sort((issue1, issue2) => {
							if (issue1.typeCode !== issue2.typeCode) {
								return parseFloat(issue1.typeCode) - parseFloat(issue2.typeCode);
							}
							if (issue1.code !== issue2.code) {
								return issue1.code.localeCompare(issue2.code);
							}
							if (issue1.context !== issue2.context) {
								return issue1.context.localeCompare(issue2.context);
							}
							return 0;
						});
					for (let i = 0; i < issues.length; i++) { 
						let issue = issues[i];__p += '\n				<li class="result ' +
	((__t = ( issue.type )) == null ? '' : __t) +
	'" data-selector="' +
	((__t = ( issue.selector )) == null ? '' : __t) +
	'">\n					<h2 class="issue-title">' +
	((__t = ( issue.message.replace(/</g, '&lt;').replace(/>/g, '&gt;') )) == null ? '' : __t) +
	'</h2>\n					<p class="issue-rule">' +
	((__t = ( issue.code.replace(/</g, '&lt;').replace(/>/g, '&gt;') )) == null ? '' : __t) +
	'</p>\n					<pre class="issue-code"><code>' +
	((__t = ( (issue.context || '').replace(/</g, '&lt;').replace(/>/g, '&gt;') )) == null ? '' : __t) +
	'</code></pre>\n				</li>\n				';
	 }__p += '\n			</ul>\n\n			<hr />\n\n			<footer>\n				<p>Generated at: ' +
	((__t = ( data.date.toLocaleString() )) == null ? '' : __t) +
	'</p>\n				<p class="credits">Powered by <a href="http://pa11y.org/" target="_blank"><img src="http://pa11y.org/resources/brand/logo.svg" alt="Pa11y logo" />Pa11y</a></p>\n			</footer>\n		</div>\n	</div>\n</body>\n</html>';
	return __p
	}

	var templateCSS = ".pa11y-report {\n    font-family: -apple-system, BlinkMacSystemFont, \"Roboto\", \"Droid Sans\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n    font-size: 16px;\n    line-height: 22px;\n    color: #333;\n}\n\n.pa11y-report h1,\n.pa11y-report h2,\n.pa11y-report p,\n.pa11y-report pre,\n.pa11y-report ul {\n    margin-top: 0;\n    margin-bottom: 0;\n}\n\n.pa11y-report h1 {\n    margin-bottom: 1rem;\n    font-size: 1.6rem;\n    line-height: 1.2em;\n    font-weight: normal;\n}\n\n.pa11y-report h1 a {\n    color: #008cff;\n    display: inline-block;\n    text-decoration: none;\n}\n\n.pa11y-report h2 {\n    font-size: 1rem;\n    line-height: 1.4em;\n}\n\n.pa11y-report pre {\n    margin: 0;\n    padding: 0 1rem 1rem 1rem;\n    margin-top: 1rem;\n    background: rgba(255, 255, 255, 0.2);\n    border-radius: 2px;\n}\n\n.pa11y-report code {\n    display: block;\n    width: 100%;\n    padding: 1rem 0;\n    white-space: nowrap;\n    overflow: auto;\n}\n\n.pa11y-report code::-webkit-scrollbar {\n    width: 6px;\n    height: 6px;\n}\n\n.pa11y-report code::-webkit-scrollbar-thumb {\n    background: rgba(0, 0, 0, 0.5);\n    border-radius: 6px;\n}\n\n.pa11y-report code::-webkit-scrollbar-track {\n    background: transparent;\n}\n\n.pa11y-report hr {\n    border: solid 2px #e5e5e5;\n    border-width: 2px 0 0 0;\n}\n\n.pa11y-report footer {\n    display: flex;\n    flex-direction: row;\n    color: #999;\n}\n\n.pa11y-report footer > *:first-child {\n    flex: 1 auto;\n}\n\n.pa11y-report footer a {\n    color: #000;\n    text-decoration: none;\n}\n\n.pa11y-report footer a img {\n    height: 2em;\n    margin: 0 0.5em 0 0.75em;\n    vertical-align: middle;\n}\n\n.pa11y-report .pa11y-page {\n    max-width: 800px;\n    padding: 2rem 1rem;\n}\n\n.pa11y-report form {\n    display: flex;\n    flex-direction: row;\n    flex-wrap: wrap;\n    align-items: flex-start;\n    margin-top: 30px;\n}\n\n.pa11y-report form label {\n    position: relative;\n    padding: 1rem;\n    margin-bottom: 2px;\n    font-size: 1em;\n    line-height: 1em;\n    background: transparent;\n    border: 0;\n    border-radius: 0;\n    cursor: pointer;\n    transition: background 150ms ease-out;\n    outline: 0;\n}\n\n.pa11y-report form input {\n    display: none;\n}\n\n.pa11y-report form input:checked + label {\n    border-bottom: solid 2px currentColor;\n    margin-bottom: 0;\n}\n\n.pa11y-report form label:focus,\n.pa11y-report form label:hover {\n    background: rgba(0, 0, 0, 0.05);\n    transition: none;\n}\n\n.pa11y-report form label:active {\n    background: rgba(0, 0, 0, 0.1);\n    transition: none;\n}\n\n.pa11y-report form output {\n    display: block;\n    flex: none;\n    width: 100%;\n}\n\n.pa11y-report .issue-rule {\n    word-break: break-all;\n}\n\n.pa11y-report form input:not([value=\"all\"]):checked ~ output li {\n    display: none;\n}\n\n.pa11y-report form input[value=\"errors\"]:checked ~ output li.error {\n    display: block;\n}\n\n.pa11y-report form input[value=\"warnings\"]:checked ~ output li.warning {\n    display: block;\n}\n\n.pa11y-report form input[value=\"notices\"]:checked ~ output li.notice {\n    display: block;\n}\n\n.pa11y-report .count-error {\n    color: #E74C3C;\n}\n\n.pa11y-report .count-warning {\n    color: #F39C12;\n}\n\n.pa11y-report .count-notice {\n    color: #3498DB;\n}\n\n.pa11y-report .clean-list {\n    margin-left: 0;\n    padding-left: 0;\n    list-style: none;\n}\n\n.pa11y-report .results-list {\n    margin-top: 1rem;\n}\n\n.pa11y-report .result {\n    padding: 1rem;\n    margin-bottom: 1rem;\n}\n\n.pa11y-report .error {\n    background-color: rgba(231, 76, 60, 0.5);\n}\n\n.pa11y-report .warning {\n    background-color: rgba(243, 156, 18, 0.5);\n}\n\n.pa11y-report .notice {\n    background-color: rgba(52, 152, 219, 0.5);\n}\n\n.pa11y-report .screenshot {\n    max-width: 100%;\n    display: block;\n}\n\n.pa11y-report .screenshot-container {\n    border: solid #d5d5d5;\n    border-width: 30px 4px 4px;\n    border-radius: 4px;\n    overflow: scroll;\n    max-height: 500px;\n    margin: 2em auto;\n    display: block;\n}\n\n.pa11y-report .buttons-container {\n    position: absolute;\n    margin-top: -24px;\n    margin-left: 5px;\n}\n\n.pa11y-report .button-osx {\n    width: 10px;\n    height: 10px;\n    display: inline-block;\n    border-radius: 10px;\n}\n\n.pa11y-report .close {\n    background: #ff5c5c;\n    border: 1px solid #e33e41;\n}\n\n.pa11y-report .minimize {\n    background: #ffbd4c;\n    border: 1px solid #e09e3e;\n}\n\n.pa11y-report .zoom {\n    background: #00ca56;\n    border: 1px solid #14ae46;\n}";

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
