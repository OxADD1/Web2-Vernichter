const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Statische Dateien aus dem "public"-Ordner bereitstellen
app.use(express.static(path.join(__dirname, 'public')));

// Index.html als Startseite
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html', 'index.html'));
});

// Server starten
app.listen(PORT, () => {
    console.log(`Frontend-Server läuft auf http://localhost:${PORT}`);
});
