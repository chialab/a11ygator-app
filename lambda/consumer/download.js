const https = require('https');
const { URL } = require('url');

const download = (url) => new Promise((resolve, reject) => {
  url = new URL(url);

  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400) {
      // Redirect.
      const redirect = res.headers['location'];
      console.log(`Being redirected to ${redirect}`);
      resolve(download(redirect));

      return;
    }
    if (res.statusCode >= 400) {
      // Client or server error.
      console.error(`GET ${url} -> ${res.statusCode} ${res.statusMessage}`);
      reject(`${res.statusCode} ${res.statusMessage}`);

      return;
    }

    let buf = Buffer.alloc(0);
    res.on('data', (chunk) => {
      buf = Buffer.concat([buf, Buffer.from(chunk)]);
    });
    res.on('end', () => {
      console.log('Content-Length', res.headers['content-length']);

      resolve(buf);
    });
  });
});

module.exports = download;
