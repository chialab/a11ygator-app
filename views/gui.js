function parseScreenshotName(url) {
    return `${url.replace(/[/:.]/g, '_')}.png`;
}
