/////////////////
// WebAnwendungen 2 Project
// Wintersemester 2024, HS Albstadt-Sigmaringen, INF
// Finance - Planer
// von Amani, Tim, Evelin, Adrian

// Importiert benötigte Hilfsdateien für spezielle Funktionen.
const helper = require('./helper.js');
const fileHelper = require('./fileHelper.js');

console.log('Starting server...');

try {
    // Verbindet die Datenbank
    console.log('Connect database...');
    const Database = require('better-sqlite3'); // SQLite3 Datenbank für schnelle, einfache Speicherung
    const dbOptions = { verbose: console.log }; // Debugging-Optionen, um SQL-Befehle zu loggen
    const dbFile = './db/finanzbank.sqlite'; // Datenbank-Dateipfad
    const dbConnection = new Database(dbFile, dbOptions); // Verbindet die Datenbank mit den angegebenen Optionen

    // Definiert den Serverport
    const HTTP_PORT = 8000;

    // Importiert Express und weitere benötigte Middleware
    const express = require('express');
    const fileUpload = require('express-fileupload'); // Ermöglicht Datei-Uploads
    const cors = require('cors'); // Erlaubt Cross-Origin Requests
    const bodyParser = require('body-parser'); // Parst JSON- und URL-Daten aus Anfragen
    const morgan = require('morgan'); // Loggt HTTP-Anfragen
    const _ = require('lodash'); // Utility-Bibliothek für erweiterte Funktionen

    console.log('Creating and configuring Web Server...');
    const app = express(); // Erstellt die Express-App

    // Stellt die Datenbankverbindung im globalen Kontext der App bereit
    app.locals.dbConnection = dbConnection;

    console.log('Binding middleware...');
    app.use(express.static(__dirname + '/public')); // Macht statische Dateien im Verzeichnis "public" zugänglich
    app.use(fileUpload({
        createParentPath: true, // Erlaubt das Erstellen fehlender Verzeichnisse
        limits: {
            fileSize: 2 * 1024 * 1024 // Beschränkt die Dateigröße auf 2 MB
        }
    }));
    app.use(cors()); // Aktiviert CORS für alle Routen
    app.use(bodyParser.urlencoded({ extended: true })); // Parst URL-encoded Daten
    app.use(bodyParser.json()); // Parst JSON-Daten
    app.use(function(request, response, next) {
        // Fügt CORS-spezifische Header hinzu
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next(); // Fährt mit der nächsten Middleware fort
    });
    app.use(morgan('dev')); // Loggt HTTP-Anfragen im Entwicklungsmodus

    // Definiert den Basispfad für API-Endpunkte
    const TOPLEVELPATH = '/api';
    console.log('Binding endpoints, top level Path at ' + TOPLEVELPATH);

    // Bindet verschiedene Service-Router für unterschiedliche API-Endpunkte
    var serviceRouter = require('./services/kundenserviceService.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/benutzer.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/transaktion.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/bankkonto.js');
    app.use(TOPLEVELPATH, serviceRouter);

    serviceRouter = require('./services/kategorie.js');
    app.use(TOPLEVELPATH, serviceRouter);

    // Definiert eine Middleware für nicht gefundene Ressourcen
    app.use(function(request, response) {
        console.log('Error occurred, 404, resource not found');
        response.status(404).json({ 'fehler': true, 'nachricht': 'Die Biene sagt, der Pfad ist nicht vorhanden!' });
    });

    // Startet den Webserver
    console.log('\nBinding Port and starting Webserver...');
    var webServer = app.listen(HTTP_PORT, () => {
        console.log('Listening at localhost, port ' + HTTP_PORT);
        console.log('\nUsage: http://localhost:' + HTTP_PORT + TOPLEVELPATH + "/SERVICENAME/SERVICEMETHOD/....");
        console.log('\nVersion 4.3.0\nWintersemester 2024, HS Albstadt-Sigmaringen, INF');
        console.log('\n\n-----------------------------------------');
        console.log('exit / stop Server by pressing 2 x CTRL-C');
        console.log('-----------------------------------------\n\n');
    });

} catch (ex) {
    // Fangt Fehler während der Initialisierung ab
    console.error(ex);
}
