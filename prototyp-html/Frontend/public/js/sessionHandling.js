// Speichert oder überschreibt einen Wert in der SessionStorage
function setSessionItem(label, value) {
    sessionStorage.setItem(label, value); // Speichert den Wert mit dem angegebenen Schlüssel (label)
}

// Ruft einen Wert aus der SessionStorage ab
// Gibt `null` zurück, wenn der Schlüssel nicht existiert
function getSessionItem(label) {
    return sessionStorage.getItem(label); // Holt den Wert für den angegebenen Schlüssel (label)
}

// Prüft, ob ein Eintrag in der SessionStorage existiert
function existsSessionItem(label) {
    return !isNullOrUndefined(getSessionItem(label)); // Gibt `true` zurück, wenn ein Wert existiert, andernfalls `false`
}

// Speichert oder überschreibt ein JSON-Objekt in der SessionStorage
function setJSONSessionItem(label, jsonValue) {
    setSessionItem(label, JSON.stringify(jsonValue)); // Wandelt das JSON-Objekt in einen String um und speichert es
}

// Ruft ein JSON-Objekt aus der SessionStorage ab
// Gibt `null` zurück, wenn der Schlüssel nicht existiert
// Wandelt den JSON-String zurück in ein JSON-Objekt, falls vorhanden
function getJSONSessionItem(label) {
    var val = getSessionItem(label); // Holt den gespeicherten Wert

    // Wenn der Wert nicht existiert, wird `null` zurückgegeben
    if (isNullOrUndefined(val)) 
        return val;

    // Wenn es ein JSON-String ist, wird es in ein JSON-Objekt umgewandelt
    if (isJSONString(val)) 
        return tryParseJSONString(val);

    // Ansonsten wird der Wert als String zurückgegeben
    return val;
}

// Entfernt einen Eintrag aus der SessionStorage anhand des Schlüssels
function removeSessionItem(label) {
    sessionStorage.removeItem(label); // Entfernt den Eintrag mit dem angegebenen Schlüssel
}

// Löscht alle Einträge in der SessionStorage
function clearSession() {
    sessionStorage.clear(); // Löscht die gesamte SessionStorage
}

// Versucht, einen JSON-String zu parsen
// Gibt `false` zurück, wenn der String kein gültiges JSON ist, andernfalls das geparste JSON-Objekt
function tryParseJSONString(str) {
    try {
        var obj = JSON.parse(str); // Versucht, den String als JSON zu parsen
        if (obj && typeof obj === "object") 
            return obj; // Gibt das JSON-Objekt zurück, wenn es erfolgreich ist
    } catch (e) { } // Fängt Parsing-Fehler ab
    return false; // Gibt `false` zurück, wenn das Parsen fehlschlägt
}

// Prüft, ob der gegebene String ein JSON-String ist
function isJSONString(str) {
    return tryParseJSONString(str) != false; // Gibt `true` zurück, wenn es ein JSON-String ist, andernfalls `false`
}

// Prüft, ob der gegebene Wert `null` oder `undefined` ist
function isNullOrUndefined(val) {
    return val === null || val === undefined; // Gibt `true` zurück, wenn der Wert `null` oder `undefined` ist
}
