import compile from 'lodash/template';
import templateString from './reporter.tpl';
import templateCSS from './reporter.css';

const report = {};

// Pa11y version support
report.supports = '^5.0.0 || ^5.0.0-alpha || ^5.0.0-beta';

// Compile template and output formatted results
report.results = async results => {
    const template = compile(templateString);
    return template({

        css: templateCSS,

        // The current date
        date: new Date(),

        // Result information
        documentTitle: results.documentTitle,
        issues: results.issues.map(issue => {
            issue.typeLabel = upperCaseFirst(issue.type);
            return issue;
        }),
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

export default report;