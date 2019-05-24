const errorMessage = (error) => `<div class="error">${error || ''}</div>`;

/**
 * Fetch report.
 *
 * @param {string} id Report ID.
 * @param {'html' | 'json'} format Report format.
 * @returns {Promise<{ statusCode: number, body: string }>}
 */
self.fetchReport = (id, format) => fetch(`api/reports/${id}?format=${format || 'html'}&ts=${Date.now()}`)
  .then((res) => {
    if (res.status === 204) {
      return Promise.reject();
    }

    return res.text()
      .then((body) => ({ statusCode: res.status, body }));
  });

self.sendData = function (ev) {
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
              .then(({ statusCode, body }) => {
                clearInterval(interval);

                switch (statusCode) {
                  case 200:
                    const parser = new DOMParser();
                    const htmlDocument = parser.parseFromString(body, 'text/html');
                    const reportElement = htmlDocument.querySelector('.pa11y-report');
                    resultContainer.innerHTML = reportElement.outerHTML;
                    break;

                  case 422:
                    resultContainer.innerHTML = errorMessage('The URL you provided could not be reached. Are you sure it is correct?');
                    break;

                  default:
                    resultContainer.innerHTML = errorMessage('An unknown error occurred. Please try again!');
                }
              })
              .catch(() => console.error('Report not yet ready'));
          },
          data.config.wait
        );
      })
      .catch((err) => {
        resultContainer.innerHTML = errorMessage(err.message);
      });
}
