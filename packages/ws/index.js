const express = require('express')
const app = express()
const chia11y = require('./chia11y');

const PORT = process.env.PORT || 9000;

app.use('/screenshots', express.static(__dirname + '/screenshots'));
app.use('/app', express.static(__dirname + '/public'));

app.listen(PORT);
