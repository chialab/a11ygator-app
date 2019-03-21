const app = require('./src/app.js').app;

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`a11ygator is waiting for you on http://localhost:${PORT}`);
});
