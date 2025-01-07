// Importiert die jsonwebtoken-Bibliothek für das Arbeiten mit JWTs (JSON Web Tokens)
const jwt = require('jsonwebtoken');

// Importiert Token-Einstellungen (Algorithmus, Geheimnis, maximale Gültigkeitsdauer)
const { TOKEN_ALGORITHM, TOKEN_SECRET, TOKEN_MAX_AGE } = require('./tokenSettings.js');

// Funktion, die Daten verschlüsselt und als Token zurückgibt
// Wird als Exportfunktion bereitgestellt
module.exports.encrypt = function(dataToEncrypt) {
    console.log('creating token with data', dataToEncrypt); // Debugging-Ausgabe

    // Erstellt und signiert ein Token mit den übergebenen Daten
    var encrypted = jwt.sign(dataToEncrypt, TOKEN_SECRET, { 
        algorithm: TOKEN_ALGORITHM, 
        expiresIn: TOKEN_MAX_AGE 
    });

    console.log('token created and encrypted'); // Debugging-Ausgabe
    return encrypted; // Gibt das verschlüsselte Token zurück
};
