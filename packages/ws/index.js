const express = require('express')
const app = express()
const chia11y = require('./chia11y');
var bodyParser = require('body-parser')

const PORT = process.env.PORT || 9000;

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use("/screenshots", express.static(__dirname + '/screenshots'));

app.all('/', async function (req, res) {
    const url = req.query && req.query.url;
    if (!url) {
        res.status(400);
        return res.send('Missing url');
    }
    const options = req.body;
    delete options.url;
    const result = await chia11y(url, options);
    res.send(result)
})

app.listen(PORT);
