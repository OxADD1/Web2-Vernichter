// Einstellungen für die jsonwebtoken-Bibliothek
// Details: https://www.npmjs.com/package/jsonwebtoken

// Definiert den Algorithmus zur Token-Signierung
const algorithm = 'HS512'; // HS512 ist ein HMAC-Algorithmus mit SHA-512 Hashing

// Definiert das Geheimnis, das für die Token-Signierung verwendet wird
const secret = 'ichBinEineGEHEIMeBiene'; // Sollte in der Praxis sicherer aufbewahrt werden, z. B. in Umgebungsvariablen

// Maximale Gültigkeitsdauer des Tokens
const max_age = '1h'; // Das Token ist eine Stunde gültig

// Exportiert die Einstellungen, damit sie in anderen Dateien genutzt werden können
exports.TOKEN_ALGORITHM = algorithm;
exports.TOKEN_SECRET = secret;
exports.TOKEN_MAX_AGE = max_age;
