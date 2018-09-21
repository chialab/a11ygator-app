const express = require('express')
const chia11y = require('./chia11y.js');
const app = express()

const PORT = process.env.PORT || 9000;

app.use('/screenshots', express.static(__dirname + '/screenshots'));
app.use('/app', express.static(__dirname));

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
    const result = await chia11y(url, options);
    res.send(result)
});

app.get('/app', (req, res) => {
    res.sendFile('public/index.html', { root : __dirname});
});

app.listen(PORT);
