module.exports = {
    includeNotices: true,
    includeWarnings: true,
    standard: "WCAG2AAA",
    wait: 8000,
    chromeLaunchConfig: {
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            '--disable-dev-shm-usage',
            '--single-process'
        ]
    },
}
