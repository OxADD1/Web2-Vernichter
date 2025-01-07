// Importiert die jsonwebtoken-Bibliothek
const jwt = require('jsonwebtoken');

// Importiert Token-Einstellungen (Algorithmus, Geheimnis, maximale Gültigkeitsdauer)
const { TOKEN_ALGORITHM, TOKEN_SECRET, TOKEN_MAX_AGE } = require('./tokenSettings.js');

// Middleware-Funktion zur Validierung von Tokens
// Das Token muss im Header der HTTP-Anfrage unter "Authorization" stehen, mit dem Präfix "Bearer"
// Die Funktion wird als Export bereitgestellt
module.exports = function (request, response, next) {
    console.log('Middleware for validating token was called'); // Debugging-Ausgabe

    // Überprüft, ob das Authorization-Attribut im Header vorhanden ist
    if (request.headers['authorization'] === undefined) {
        console.log('Authorization attribute not found in header'); // Debugging-Ausgabe
        response.status(401).json({ 'fehler': true, 'nachricht': 'Token was not provided' }); // Fehlerantwort
        return;
    }

    // Extrahiert den Inhalt des Authorization-Headers und überprüft das Format
    var tmp = request.headers['authorization'];
    if (!tmp.startsWith('Bearer') || tmp.length < 50) {
        console.log('Authorization attribute has invalid format'); // Debugging-Ausgabe
        response.status(401).json({ 'fehler': true, 'nachricht': 'Token format mismatch' }); // Fehlerantwort
        return;
    }

    // Entfernt das "Bearer"-Präfix und validiert das Token
    tmp = tmp.slice(7); // Entfernt die ersten 7 Zeichen ("Bearer ")
    try {
        console.log('Verifying found Token'); // Debugging-Ausgabe
        var decrypted = jwt.verify(tmp, TOKEN_SECRET, { 
            algorithm: TOKEN_ALGORITHM, 
            expiresIn: TOKEN_MAX_AGE 
        }); // Validiert das Token mit den Einstellungen

        console.log('Token successfully decrypted and is valid, created, validTill', decrypted.iat, decrypted.exp); // Debugging-Ausgabe
    } catch (ex) {
        console.log('Validation failed'); // Debugging-Ausgabe
        response.status(401).json({ 'fehler': true, 'nachricht': 'Token is not valid' }); // Fehlerantwort
        return;
    }

    // Token ist gültig: Benutzer-ID aus dem Token im Request-Objekt speichern
    request.userId = decrypted.userId; // Benutzer-ID für spätere Verwendung speichern
    console.log('Remembered userId', request.userId); // Debugging-Ausgabe

    next(); // Nächste Middleware oder Route aufrufen
};
