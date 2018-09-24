const express = require('express')
const chia11y = require('./chia11y.js');
const app = express()

const PORT = process.env.PORT || 9000;

app.use('/screenshots', express.static(__dirname + '/screenshots'));
app.use('/app', express.static(__dirname + '/app'));

app.all('/', async function (req, res) {
    const url = req.query && req.query.url;
    if (!url) {
        res.status(400);
        return res.send('Missing url');
    }
    const options = req.body || {};
    if (options.url) {
        delete options.url;
    }
    return chia11y(url, options).then((result) => res.send(result));
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Pa11y dashboard listening on http://127.0.0.1:${PORT}`);
});
