document.addEventListener('DOMContentLoaded', () => {
    // Warten, bis das DOM vollständig geladen ist
    const form = document.querySelector('.feedback-container form'); // Formular im DOM auswählen

    // Event-Listener für das Absenden des Formulars hinzufügen
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Verhindert, dass die Seite neu geladen wird, wenn das Formular abgeschickt wird

        // Feedback-Typ (Feedback oder Problem) auslesen
        const type = document.querySelector('input[name="feedback_type"]:checked')?.id;

        // Formulardaten aus den Eingabefeldern auslesen
        const anrede = document.getElementById('anrede').value; // Anrede (z. B. Frau oder Herr)
        const name = document.getElementById('name').value.trim(); // Name des Benutzers
        const email = document.getElementById('email').value.trim(); // E-Mail-Adresse des Benutzers
        const nachricht = document.getElementById('nachricht').value.trim(); // Nachricht des Benutzers

        // Validierung der Formulardaten
        if (!type || name.length === 0 || !validateEmail(email) || nachricht.length === 0) {
            alert('Bitte füllen Sie alle Pflichtfelder aus.'); // Fehlermeldung bei unvollständigen Feldern
            return; // Beende die Verarbeitung
        }

        // Daten in ein JSON-Objekt formatieren
        const data = {
            typ: type, // Feedback-Typ
            anrede: anrede, // Anrede
            name: name, // Benutzername
            email: email, // Benutzer-E-Mail
            nachricht: nachricht // Nachrichtentext
        };

        // Token aus dem Session Storage abrufen
        const token = sessionStorage.getItem('token'); // Zugriff auf den Token
        if (!token) {
            alert('Sie müssen eingeloggt sein, um dieses Formular zu nutzen.'); // Meldung bei fehlendem Token
            window.location.href = '../login.html'; // Weiterleitung zur Login-Seite
            return; // Beende die Verarbeitung
        }

        // AJAX-Request: Daten an das Backend senden
        $.ajax({
            url: 'http://localhost:8000/api/kundenservice', // API-Endpunkt
            method: 'POST', // HTTP-Methode
            headers: {
                'Content-Type': 'application/json', // Inhaltstyp: JSON
                'Authorization': `Bearer ${token}` // Token im Header für Authentifizierung senden
            },
            data: JSON.stringify(data) // Daten im JSON-Format senden
        })
        .done(function (response) {
            // Bei erfolgreicher Anfrage
            alert(`Vielen Dank für Ihr Feedback! Ihre ID ist: ${response.id}`); // Erfolgsmeldung mit der ID der Nachricht
            form.reset(); // Formular zurücksetzen
        })
        .fail(function (jqXHR) {
            // Fehlerbehandlung
            if (jqXHR.status === 401) {
                alert('Session abgelaufen. Bitte melden Sie sich erneut an.'); // Meldung bei ungültigem Token
                window.location.href = '../login.html'; // Weiterleitung zur Login-Seite
            } else {
                console.error('Fehler beim Senden der Nachricht:', jqXHR.responseText); // Konsolenlog für den Fehler
                alert('Es gab ein Problem beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut.'); // Fehlerhinweis für den Benutzer
            }
        });
    });

    // Hilfsfunktion: Überprüfung der E-Mail-Adresse mit Regex
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex für die Validierung von E-Mails
        return regex.test(email); // Gibt true zurück, wenn die E-Mail gültig ist
    }
});
