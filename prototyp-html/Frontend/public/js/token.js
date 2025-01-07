// Globales Objekt für Benutzerinformationen
var userObj = null; // Speicher für Benutzerobjekte (könnte erweitert werden)
var credentials = null; // Speicher für Anmeldedaten (z. B. Token)

// Konstante für den Schlüssel der Session-Daten
const CRED_HANDLE = 'credentials'; // Schlüsselname für gespeicherte Anmeldedaten in der Sitzung

// Funktion zum Speichern eines Tokens in der Session
function saveToken(obj) {
    console.log('Saving credentials to session'); // Log für Debugging
    setJSONSessionItem(CRED_HANDLE, obj); // Speichert das übergebene Token-Objekt in der Sitzung
}

// Funktion zum Entfernen des Tokens aus der Session
function removeToken() {
    console.log('Removing credentials from session'); // Log für Debugging
    removeSessionItem(CRED_HANDLE); // Entfernt das Token aus der Sitzung
}

// Funktion, um das gespeicherte Token-Objekt aus der Session abzurufen
function getTokenObj() {
    return getJSONSessionItem(CRED_HANDLE); // Gibt das gespeicherte Token-Objekt zurück
}

// Funktion, um den Benutzer zur Login-Seite weiterzuleiten
function jumpToLogin() {
    console.log('Jumping to login page'); // Log für Debugging
    document.location.href = 'login.html'; // Ändert die Seite auf die Login-Seite
}

// Funktion zur Überprüfung, ob ein Token in der Session existiert
function validateTokenExistence() {
    console.log('Validating existence of credentials'); // Log für Debugging

    // Wenn keine Anmeldedaten in der Sitzung gefunden werden, leite zur Login-Seite um
    if (!existsSessionItem(CRED_HANDLE)) {
        console.log('No credentials in session found, break away'); // Log für Debugging
        jumpToLogin(); // Leitet zur Login-Seite weiter
    } else {
        console.log('Credentials found in session'); // Bestätigt, dass Anmeldedaten vorhanden sind
    }
}

// Funktion, um ein Autorisierungsobjekt für Anfragen zu erstellen
function getAuthorizationObject() {
    return { 'Authorization': 'Bearer ' + getTokenObj().token }; // Gibt den Autorisierungs-Header zurück
}

// Initialisierung bei Seitenladevorgang
$(document).ready(function() {
    // Bindet den Logout-Button an eine Funktion
    $('#logoutButton').click(function() {
        removeToken(); // Entfernt das gespeicherte Token
        jumpToLogin(); // Leitet zur Login-Seite weiter
    });
});
