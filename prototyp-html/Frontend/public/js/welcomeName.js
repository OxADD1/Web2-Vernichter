$(document).ready(function() {
    console.log("Starte AJAX-Request für den Benutzernamen...");

    /**
     * Lädt den Benutzernamen basierend auf der Benutzer-ID aus dem Token.
     * Erwartet vom Server ein JSON-Objekt mit dem Benutzernamen.
     */
    function loadBenutzerName() {
        console.log("Rufe /benutzer/me auf...");
        console.log(getAuthorizationObject());

        // GET-Request zum Abrufen des Benutzernamens
        $.ajax({
            url: 'http://localhost:8000/api/benutzer/me',
            method: 'GET',
            contentType: 'application/json; charset=utf-8',
            cache: false,
            dataType: 'json',
            headers: getAuthorizationObject() // Token im Header mitschicken
        }).done(function(response) {
            console.log("Benutzerdaten erhalten:", response);

            // Benutzernamen im Welcome-Element anzeigen
            $('#welcomeName').text(`Hallo ${response.benutzername}!`);
        }).fail(function(jqXHR) {
            console.error("Fehler beim Abrufen der Benutzerdaten:", jqXHR.responseText);
            $('#welcomeName').text("Hi Benutzer!"); // Fallback
        });
    }

    // Direkt beim Laden der Seite den Benutzernamen abrufen
    loadBenutzerName();
});
