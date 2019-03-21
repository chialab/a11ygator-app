const express = require('express')
const a11ygator = require('./a11ygator.js');
const app = express()

const PORT = process.env.PORT || 6000;

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
    return a11ygator(url, options).then((result) => res.send(result));
});

app.listen(PORT, () => {
    console.log(`a11ygator listening on http://localhost:${PORT}`);
});
