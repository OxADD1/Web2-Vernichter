$(document).ready(function () {
    // Token und Sessiondaten über Session-Handling abrufen
    const credentials = getJSONSessionItem('credentials'); // Ruft die Anmeldeinformationen aus der Session ab
    if (!credentials || !credentials.token) {
        // Wenn kein Token vorhanden ist, wird der Benutzer zur Login-Seite weitergeleitet
        alert('Sie müssen eingeloggt sein, um dieses Formular zu nutzen.');
        window.location.href = '../login.html'; // Weiterleitung zur Login-Seite
        return; // Beendet die Ausführung des Scripts
    }

    const token = credentials.token; // Extrahiert das Token aus den Anmeldeinformationen

    // Ereignislistener für das Absenden des Formulars
    $('#feedbackForm').on('submit', function (event) {
        event.preventDefault(); // Verhindert die Standardaktion des Formulars (Seitenneuladen)

        // Formulardaten sammeln
        const typ = $('input[name="feedback_type"]:checked').val(); // Typ des Feedbacks (z. B. Lob, Beschwerde)
        const anrede = $('#anrede').val(); // Anrede (z. B. Herr/Frau)
        const name = $('#name').val().trim(); // Name des Benutzers
        const email = $('#email').val().trim(); // E-Mail-Adresse des Benutzers
        const nachricht = $('#nachricht').val().trim(); // Nachrichtentext

        // Validierung der Eingaben
        if (!typ || !anrede || !name || !email || !nachricht) {
            alert('Bitte füllen Sie alle Felder aus.'); // Warnung, falls Felder fehlen
            return; // Abbruch der Verarbeitung
        }

        console.log("Ausgewählter Typ:", typ); // Debugging-Ausgabe des Feedback-Typs

        // Erstellen des Payloads (Datenpaket für die Anfrage)
        const payload = {
            typ: typ,
            anrede: anrede,
            name: name,
            email: email,
            nachricht: nachricht
        };

        // AJAX-Anfrage
        $.ajax({
            url: 'http://localhost:8000/api/kundenservice', // Endpunkt für das Feedback
            method: 'post', // HTTP-Methode POST
            headers: {
                'Content-Type': 'application/json', // JSON-Inhaltstyp für die Anfrage
                'Authorization': `Bearer ${token}` // Autorisierungstoken im Header
            },
            data: JSON.stringify(payload), // Formulardaten in JSON umwandeln und senden
            success: function (response) {
                // Bei erfolgreicher Anfrage
                alert('Ihre Nachricht wurde erfolgreich gesendet.'); // Erfolgsmeldung
                $('#feedbackForm').trigger('reset'); // Setzt das Formular zurück
            },
            error: function (jqXHR) {
                // Bei einem Fehler
                alert('Fehler: ' + (jqXHR.responseText || 'Ein Problem ist aufgetreten.')); // Fehlermeldung anzeigen
                console.error('Fehlerdetails:', jqXHR); // Debugging-Ausgabe des Fehlers
            }
        });
    });
});
