(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Reporter = factory());
}(this, (function () { 'use strict';

	function template(data) {
	var __t, __p = '';
	__p += '<!DOCTYPE html>\n<html lang="en">\n<head>\n\n	<meta charset="utf-8"/>\n	<title>Accessibility report for "' +
	((__t = ( data.documentTitle )) == null ? '' : __t) +
	'"</title>\n\n</head>\n<body>\n\n	<style>' +
	((__t = ( data.css )) == null ? '' : __t) +
	'</style>\n\n	<div class="page">\n\n		<h1>Accessibility Report For "' +
	((__t = ( data.documentTitle )) == null ? '' : __t) +
	'"</h1>\n\n		<p class="counts">\n			<span class="count error">' +
	((__t = ( data.errorCount )) == null ? '' : __t) +
	' errors</span>\n			<span class="count warning">' +
	((__t = ( data.warningCount )) == null ? '' : __t) +
	' warnings</span>\n			<span class="count notice">' +
	((__t = ( data.noticeCount )) == null ? '' : __t) +
	' notices</span>\n		</p>\n\n		<ul class="clean-list results-list">\n			';

				let issues = data.issues.slice(0);
				issues.sort((issue1, issue2) => parseFloat(issue1.typeCode) - parseFloat(issue2.typeCode));
				for (let i = 0; i < issues.length; i++) { 
					let issue = issues[i];__p += '\n			<li class="result ' +
	((__t = ( issue.type )) == null ? '' : __t) +
	'" data-selector="' +
	((__t = ( issue.selector )) == null ? '' : __t) +
	'">\n				<h2>' +
	((__t = ( issue.type )) == null ? '' : __t) +
	': ' +
	((__t = ( issue.message.replace(/</g, '&lt;').replace(/>/g, '&gt;') )) == null ? '' : __t) +
	'</h2>\n				<p>' +
	((__t = ( issue.code.replace(/</g, '&lt;').replace(/>/g, '&gt;') )) == null ? '' : __t) +
	'</p>\n				<pre>' +
	((__t = ( issue.context.replace(/</g, '&lt;').replace(/>/g, '&gt;') )) == null ? '' : __t) +
	'</pre>\n			</li>\n			';
	 }__p += '\n		</ul>\n\n		<hr />\n\n		<p>Generated at: ' +
	((__t = ( data.date.toLocaleString() )) == null ? '' : __t) +
	'</p>\n	</div>\n\n</body>\n</html>';
	return __p
	}

	var templateCSS = "html,\nbody {\n    margin: 0;\n    padding: 0;\n    background-color: #fff;\n    font-family: -apple-system, BlinkMacSystemFont, \"Roboto\", \"Droid Sans\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n    font-size: 16px;\n    line-height: 22px;\n    color: #333;\n}\n\nli {\n    margin-bottom: 15px;\n}\n\nh1, h2, p, pre, ul {\n    margin-top: 0;\n    margin-bottom: 0;\n}\n\nh1 {\n    margin-bottom: 10px;\n    font-size: 24px;\n    line-height: 24px;\n}\n\nh2 {\n    font-size: 16px;\n}\n\npre {\n    white-space: pre-wrap;\n    overflow: auto;\n}\n\nhr {\n    border: solid 2px #e5e5e5;\n    border-width: 2px 0 0 0;\n}\n\n.page {\n    max-width: 800px;\n    margin: 0 auto;\n    padding: 2rem 1rem;\n}\n\n.counts {\n    margin-top: 30px;\n}\n\n.count {\n    display: inline-block;\n    padding: 1rem;\n    line-height: 1em;\n}\n\n.clean-list {\n    margin-left: 0;\n    padding-left: 0;\n    list-style: none;\n}\n\n.results-list {\n    margin-top: 2rem;\n}\n\n.result {\n    padding: 1rem;\n}\n\n.error {\n    background-color: #fdd;\n}\n\n.warning {\n    background-color: #ffd;\n}\n\n.notice {\n    background-color: #eef4ff;\n}";

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
