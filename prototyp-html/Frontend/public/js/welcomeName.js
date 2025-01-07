$(document).ready(function() {
    console.log("Starte AJAX-Request für den Benutzernamen..."); // Debugging-Ausgabe bei Seitenladen

    /**
     * Lädt den Benutzernamen basierend auf der Benutzer-ID aus dem Token.
     * Erwartet vom Server ein JSON-Objekt mit dem Benutzernamen.
     */
    function loadBenutzerName() {
        console.log("Rufe /benutzer/me auf..."); // Debugging-Ausgabe
        console.log(getAuthorizationObject());  // Debugging-Ausgabe der Autorisierungsdaten

        // AJAX GET-Request zum Abrufen des Benutzernamens
        $.ajax({
            url: 'http://localhost:8000/api/benutzer/me', // API-Endpunkt für Benutzerdaten
            method: 'GET',                              // HTTP-Methode GET
            contentType: 'application/json; charset=utf-8', // Gibt an, dass JSON erwartet wird
            cache: false,                                  // Deaktiviert Caching
            dataType: 'json',                              // Antworttyp JSON
            headers: getAuthorizationObject()              // Fügt das Bearer-Token aus dem Token-Header hinzu
        }).done(function(response) {
            // Wird ausgeführt, wenn die Anfrage erfolgreich ist
            console.log("Benutzerdaten erhalten:", response); // Debugging-Ausgabe der erhaltenen Antwort

            // Zeigt den Benutzernamen im HTML-Element mit der ID "welcomeName" an
            $('#welcomeName').text(`Hallo ${response.benutzername}!`);
        }).fail(function(jqXHR) {
            // Fehlerbehandlung, falls die Anfrage fehlschlägt
            console.error("Fehler beim Abrufen der Benutzerdaten:", jqXHR.responseText);

            // Zeigt einen generischen Text an, wenn der Benutzername nicht geladen werden kann
            $('#welcomeName').text("Hi Benutzer!");
        });
    }

    // Direkt beim Laden der Seite den Benutzernamen abrufen
    loadBenutzerName();
});
