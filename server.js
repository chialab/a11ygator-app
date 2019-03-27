const { app } = require('./src/app.js');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`A11ygator 🐊 is waiting for you on http://localhost:${PORT}`);
});
