const helper = require('../helper.js'); // Hilfsfunktionen
const TransaktionDao = require('../dao/transaktionDao.js'); // DAO für Transaktionen
const BankkontoDao = require('../dao/bankkontoDao.js'); // DAO für Bankkonten
const validateToken = require('../tokenHandling/validateToken.js'); // Middleware zur Token-Validierung
const express = require('express'); // Express-Framework
var serviceRouter = express.Router(); // Router für diesen Service

console.log('- Service Transaktion'); // Log-Meldung zur Initialisierung

// ---------------------------- Routen-Definitionen ---------------------------- //

// 1. Alle Transaktionen des Benutzers abrufen
serviceRouter.get('/transaktion/vonBenutzer', validateToken, function(request, response) {
    console.log('Service Transaktion: Client requested all records for this userId', request.userId);

    const transaktionDao = new TransaktionDao(request.app.locals.dbConnection);
    try {
        var arr = transaktionDao.loadAllByUserId(request.userId); // Alle Transaktionen für die Benutzer-ID laden
        console.log('Service Transaktion: Records loaded, count=' + arr.length);
        response.status(200).json(arr); // Erfolgreiche Antwort
    } catch (ex) {
        console.error('Service Transaktion: Error loading all records for user. Exception occurred:', ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message }); // Fehlerantwort
    }
});

// 2. Gefilterte Transaktionen des Benutzers abrufen
serviceRouter.post('/transaktion/filtered', validateToken, function(request, response) {
    console.log('Service Transaktion: Client requests filtered transactions for userId=' + request.userId);

    const transaktionDao = new TransaktionDao(request.app.locals.dbConnection);
    let { startDatum, endDatum, kategorieId } = request.body;

    if (!startDatum) startDatum = null; // Standardwert für leeres Startdatum
    if (!endDatum) endDatum = null;     // Standardwert für leeres Enddatum
    if (!kategorieId) kategorieId = 'Alle'; // Standardwert für Kategorie

    try {
        var result = transaktionDao.loadFiltered(request.userId, startDatum, endDatum, kategorieId);
        console.log('Service Transaktion: Filtered transactions loaded.');
        response.status(200).json(result); // Erfolgreiche Antwort
    } catch (ex) {
        console.error('Service Transaktion: Error loading filtered transactions. Exception occurred:', ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message }); // Fehlerantwort
    }
});

// 3. Ausgaben nach Kategorien abrufen
serviceRouter.get('/transaktion/ausgabenNachKategorie', validateToken, function(request, response) {
    console.log('Service Transaktion: Client requests expenses grouped by category for userId=' + request.userId);

    const transaktionDao = new TransaktionDao(request.app.locals.dbConnection);
    try {
        var result = transaktionDao.getExpenseByCategory(request.userId); // Gruppierte Ausgaben laden
        console.log('Service Transaktion: Expenses by category loaded.');
        response.status(200).json(result); // Erfolgreiche Antwort
    } catch (ex) {
        console.error('Service Transaktion: Error loading expenses by category. Exception occurred:', ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message }); // Fehlerantwort
    }
});

// 4. Aktueller Kontostand (Einnahmen/Ausgaben) abrufen
serviceRouter.get('/transaktion/kontostand', validateToken, function(request, response) {
    console.log('Service Transaktion: Client requests current balance for userId=' + request.userId);

    const transaktionDao = new TransaktionDao(request.app.locals.dbConnection);
    try {
        var result = transaktionDao.getCurrentBalance(request.userId); // Kontostand berechnen
        console.log('Service Transaktion: Current balance loaded.');
        response.status(200).json(result); // Erfolgreiche Antwort
    } catch (ex) {
        console.error('Service Transaktion: Error loading current balance. Exception occurred:', ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message }); // Fehlerantwort
    }
});

// 5. Neue Transaktion erstellen und Kontostände aktualisieren
serviceRouter.post('/transaktion', validateToken, (req, res) => {
    const transaktionDao = new TransaktionDao(req.app.locals.dbConnection);
    const bankkontoDao = new BankkontoDao(req.app.locals.dbConnection);

    const userId = req.userId; // Benutzer-ID aus dem Token
    const { bankkonto_id_von, bankkonto_id_nach, kategorie_id, wert, transaktions_datum, notiz, typ } = req.body;

    try {
        // Neue Transaktion erstellen
        const neueTransaktion = transaktionDao.create(userId, bankkonto_id_von, bankkonto_id_nach, kategorie_id, wert, transaktions_datum, notiz, typ);

        // Kontostände aktualisieren basierend auf dem Typ (Ausgabe/Einnahme/Umbuchung)
        if (typ === 'ausgabe') {
            // Belastet das Quellkonto
            let kontoVon = bankkontoDao.loadById(bankkonto_id_von, userId);
            let neuerStand = parseFloat(kontoVon.kontostand) - parseFloat(wert);
            bankkontoDao.update(bankkonto_id_von, userId, kontoVon.kontoname, neuerStand, kontoVon.iban);
        } else if (typ === 'einnahme') {
            // Gutschrift auf das Konto
            let kontoVon = bankkontoDao.loadById(bankkonto_id_von, userId);
            let neuerStand = parseFloat(kontoVon.kontostand) + parseFloat(wert);
            bankkontoDao.update(bankkonto_id_von, userId, kontoVon.kontoname, neuerStand, kontoVon.iban);
        } else if (typ === 'umbuchung') {
            // Umbuchung zwischen Konten
            let kontoVon = bankkontoDao.loadById(bankkonto_id_von, userId);
            let neuerStandVon = parseFloat(kontoVon.kontostand) - parseFloat(wert);
            bankkontoDao.update(bankkonto_id_von, userId, kontoVon.kontoname, neuerStandVon, kontoVon.iban);

            if (bankkonto_id_nach) {
                let kontoNach = bankkontoDao.loadById(bankkonto_id_nach, userId);
                let neuerStandNach = parseFloat(kontoNach.kontostand) + parseFloat(wert);
                bankkontoDao.update(bankkonto_id_nach, userId, kontoNach.kontoname, neuerStandNach, kontoNach.iban);
            }
        }

        res.status(201).json(neueTransaktion); // Erfolgreiche Antwort mit der neuen Transaktion
    } catch (ex) {
        console.error('Fehler beim Erstellen der Transaktion:', ex.message);
        res.status(400).json({ fehler: true, nachricht: ex.message }); // Fehlerantwort
    }
});

// Weitere Endpunkte zur Aktualisierung, Löschung und Abruf einzelner Transaktionen sind ebenfalls enthalten.
module.exports = serviceRouter; // Exportiert den Router
