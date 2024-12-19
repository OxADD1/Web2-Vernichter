const helper = require('../helper.js');
const BenutzerDao = require('../dao/benutzerDao.js');
const createToken = require('../tokenHandling/createToken.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Benutzer');

/**Warum kein validateToken hier notwendig?
 * - Login und Registeriung sind öffentliche Endpunkte
 * - Benutzer Service dient nur der Authentifizierung fürs Login und Registrierung
 * - Sobald Benutzer eingeloggt ist, nutzt er ein Token für alle anderen Endpunkte, die 
 * Benutzerspezifische Daten laden oder ändern
 * 
 * - Nur wenn Benutzer eigene Daten ändern oder löschen möchte, bräuchte man Authentifizierung und somit die Funktion validateToken()
 * 
 * 
 * WICHIG: In REST wird 
 * - GET für lesende Operationen verwendet und sollte keine Nebenwirkungen haben aka Zustand ändern
 * - POST für Bearbeitung verwendet, aber auch um Informationen wie Token zu erstellen, was bei Login passiert.
 */



// Benutzer-Daten abrufen
serviceRouter.get('/benutzer/:id', function(request, response) {
    console.log('Service Benutzer: Client requested user data for id=' + request.params.id);

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        // Benutzer-Daten laden
        var obj = benutzerDao.loadById(request.params.id);
        console.log('Service Benutzer: User data loaded successfully');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Benutzer: Error loading user data. Exception: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});



/**
 * Route: POST /benutzer/registrieren
 * Zweck: Registriert einen neuen Benutzer in der Datenbank.
 * Anforderungen:
 *  - Der Benutzername muss einzigartig sein.
 *  - Passwort muss vorhanden sein.
 */
serviceRouter.post('/benutzer/registrieren', function(request, response) {
    console.log('Service Benutzer: Client requested user registration');

    // Validierung: Überprüfen, ob alle erforderlichen Felder vorhanden sind
    var errorMsgs = [];
    if (helper.isUndefined(request.body.benutzername)) errorMsgs.push('benutzername fehlt');
    if (helper.isUndefined(request.body.passwort)) errorMsgs.push('passwort fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Benutzer: Registration not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': helper.concatArray(errorMsgs) });
        return; // Anfrage abbrechen
    }

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        // Benutzer erstellen
        var obj = benutzerDao.create(request.body.benutzername, request.body.passwort);
        console.log('Service Benutzer: User registered successfully');
        response.status(200).json(obj); // Erfolgreiche Rückgabe der Benutzer-Daten
    } catch (ex) {
        console.error('Service Benutzer: Error during registration. Exception: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message }); // Fehlerantwort
    }
});




/**
 * Route: POST /benutzer/login
 * Zweck: Loggt einen Benutzer ein und gibt ein Token zurück.
 * Anforderungen:
 *  - Benutzername und Passwort müssen korrekt sein.
 *  - Bei Erfolg wird ein Token generiert und zurückgegeben.
 */
serviceRouter.post('/benutzer/login', function(request, response) {
    //const { username, password } = req.body;
    console.log('Service Benutzer: Client requested login');

    // Validierung: Überprüfen, ob Benutzername und Passwort vorhanden sind
    var errorMsgs = [];
    if (helper.isUndefined(request.body.benutzername)) errorMsgs.push('benutzername fehlt');
    if (helper.isUndefined(request.body.passwort)) errorMsgs.push('passwort fehlt');

    if (errorMsgs.length > 0) {
        console.log('Service Benutzer: Login not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': helper.concatArray(errorMsgs) });
        return; // Anfrage abbrechen
    }

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        // Zugang prüfen: Benutzername und Passwort validieren
        var userId = benutzerDao.hasaccess(request.body.benutzername, request.body.passwort);

        // Token erstellen: Das Token enthält die Benutzer-ID
        var token = createToken.encrypt({ userId: userId });
        console.log('Service Benutzer: Login successful, token generated');
        response.status(200).json({ 'token': token }); // Token an den Client senden
    } catch (ex) {
        console.error('Service Benutzer: Error during login. Exception: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message }); // Fehlerantwort
    }
});



/**
 * Route: GET /benutzer/:id
 * Zweck: Lädt die Daten eines Benutzers basierend auf seiner ID.
 * Anforderungen:
 *  - ID muss gültig sein.
 */
serviceRouter.get('/benutzer/:id', function(request, response) {
    console.log('Service Benutzer: Client requested user data for id=' + request.params.id);

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        // Benutzer-Daten laden
        var obj = benutzerDao.loadById(request.params.id);
        console.log('Service Benutzer: User data loaded successfully');
        response.status(200).json(obj); // Erfolgreiche Rückgabe der Benutzer-Daten
    } catch (ex) {
        console.error('Service Benutzer: Error loading user data. Exception: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message }); // Fehlerantwort
    }
});



/*serviceRouter.put('/benutzer', function(request, response) {
    console.log('Service Benutzer: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.benutzername)) 
        errorMsgs.push('benutzername fehlt');
    if (helper.isUndefined(request.body.neuespasswort)) 
        request.body.neuespasswort = null;

    if (errorMsgs.length > 0) {
        console.log('Service Benutzer: Update not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var obj = benutzerDao.update(request.body.id, request.body.benutzername, request.body.neuespasswort);
        console.log('Service Benutzer: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Benutzer: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});*/

/*serviceRouter.delete('/benutzer/:id', function(request, response) {
    console.log('Service Benutzer: Client requested deletion of record, id=' + request.params.id);

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var obj = benutzerDao.loadById(request.params.id);
        benutzerDao.delete(request.params.id);
        console.log('Service Benutzer: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Benutzer: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});


/*serviceRouter.get('/benutzer/alle', function(request, response) {
    console.log('Service Benutzer: Client requested all records');

    const benutzerDao = new BenutzerDao(request.app.locals.dbConnection);
    try {
        var arr = benutzerDao.loadAll();
        console.log('Service Benutzer: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Benutzer: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});*/

module.exports = serviceRouter;