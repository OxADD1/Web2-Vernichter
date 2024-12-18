const helper = require('../helper.js'); // Helper-Funktionen importieren
const KundenserviceDao = require('../dao/kundenserviceDao.js'); // DAO importieren
const validateToken = require('../tokenHandling/validateToken.js'); // Middleware für Tokenvalidierung
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Kundenservice');

/**
 * Route: POST /kundenservice
 * Zweck: Erstellt einen neuen Eintrag für den Kundenservice (Feedback oder Problem).
 * Anforderungen:
 *  - Validiert, dass alle Pflichtfelder ausgefüllt sind.
 *  - Fügt die userId aus dem Token als Parameter hinzu.
 */
serviceRouter.post('/kundenservice', validateToken, function (request, response) {
    console.log('Service Kundenservice: Client requested creation of new record');

    // 1. Validierung der Eingabedaten
    const { typ, anrede, name, email, nachricht } = request.body;
    var errorMsgs = [];

    if (helper.isUndefined(typ)) errorMsgs.push('typ fehlt');
    if (helper.isUndefined(anrede)) errorMsgs.push('anrede fehlt');
    if (helper.isUndefined(name)) errorMsgs.push('name fehlt');
    if (helper.isUndefined(email)) errorMsgs.push('email fehlt');
    if (helper.isUndefined(nachricht)) errorMsgs.push('nachricht fehlt');

    // Fehlerbehandlung: Fehlende Eingaben melden
    if (errorMsgs.length > 0) {
        console.log('Service Kundenservice: Creation not possible, data missing');
        response.status(400).json({
            fehler: true,
            nachricht: 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs)
        });
        return;
    }

    // 2. Benutzer-ID aus dem validierten Token auslesen
    const userId = request.userId; // Middleware validateToken fügt die userId hinzu

    // 3. DAO-Objekt erstellen
    const kundenserviceDao = new KundenserviceDao(request.app.locals.dbConnection);

    // 4. Eintrag erstellen
    try {
        const obj = kundenserviceDao.create(typ, anrede, name, email, nachricht, userId);
        console.log('Service Kundenservice: Record inserted');

        // Erfolgsmeldung mit erstelltem Datensatz
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Kundenservice: Error creating new record. Exception occurred: ' + ex.message);

        // Fehlermeldung im Fehlerfall
        response.status(400).json({ fehler: true, nachricht: ex.message });
    }
});

module.exports = serviceRouter;
