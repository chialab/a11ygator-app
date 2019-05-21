const errorMessage = (error) => `<div class="error">${error || ''}</div>`;

/**
 * Fetch report.
 *
 * @param {string} id Report ID.
 * @param {'html' | 'json'} format Report format.
 * @returns {Promise<string>}
 */
self.fetchReport = async (id, format) => fetch(`api/reports/${id}?format=${format || 'html'}&ts=${Date.now()}`)
  .then((res) => {
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    return res.text();
  });

self.sendData = async function (ev) {
    ev.preventDefault();

    const resultContainer = document.querySelector('.result-container');
    resultContainer.innerHTML = '<div class="loader"></div>';

    const form = new FormData(document.forms['site-form']);
    const data = {
      url: form.get('url'),
      config: {
        standard: form.get('standard'),
        wait: parseInt(form.get('wait'), 10),
      },
    };

    fetch('api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.id) {
          throw new Error(res.message || 'Unknown error');
        }

        const interval = setInterval(
          () => {
            fetchReport(res.id, 'html')
              .then((html) => {
                clearInterval(interval);
                const parser = new DOMParser();
                const htmlDocument = parser.parseFromString(html, 'text/html');
                const reportElement = htmlDocument.querySelector('.pa11y-report');
                resultContainer.innerHTML = reportElement.outerHTML;
              })
              .catch(console.error.bind(console, 'Report not yet ready'));
          },
          2000
        );
      })
      .catch((err) => {
        resultContainer.innerHTML = errorMessage(err.message);
      });
}
