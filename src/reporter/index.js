import template from './reporter.tpl';
import templateCSS from './reporter.css';

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

export default report;
