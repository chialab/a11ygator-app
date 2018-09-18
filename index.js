const express = require('express')
const app = express()
const chia11y = require('./src/chia11y');

app.get('/', async function (req, res) {
    const url = req.query && req.query.url;
    if (!url) {
        res.status(400);
        return res.send('Missing url');
    }
    const options = req.query;
    delete options.url;
    const result = await chia11y(url, options);
    return res.send('$i$i$i$i$i')
})

app.listen(9000);
