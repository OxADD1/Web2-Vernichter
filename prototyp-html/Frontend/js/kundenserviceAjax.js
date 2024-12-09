const { method } = require("lodash");

document.addEventListener('DOMContentLoaded', () => {
    // Formular im DOM auswählen
    const form = document.querySelector('.feedback-container form');
    // Das Formular wird über die Klasse .feedback-container und den 
    //<form>-Tag ausgewählt, wie in deinem HTML definiert.

    // Event-Listener für das Absenden des Formulars hinzufügen
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Verhindert das Neuladen der Seite

        // Feedback-Typ (Feedback oder Problem) ermitteln
        const type = document.querySelector('input[name="feedback_type"]:checked').id;

        // Formulardaten auslesen
        const anrede = document.getElementById('anrede').value;
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const nachricht = document.getElementById('nachricht').value.trim();

        const validateEmail = (email) => {
            return String(email)
              .toLowerCase()
              .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
              );
        };

        // Eingabedaten validieren
        if ( name.length==0 || validateEmail(email) || !nachricht) {
            alert('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }

        // Daten in ein JSON-Objekt vorbereiten
        const data = {
            typ: type,
            anrede: anrede,
            name: name,
            email: email,
            nachricht: nachricht
        };
        /*
        try {
            // AJAX-Request: Daten an das Backend senden
            const response = await fetch('http://localhost:8000/api/kundenservice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            

            // Antwort vom Server verarbeiten
            if (response.ok) {
                const result = await response.json();
                alert(`Vielen Dank für Ihr Feedback! Ihre ID ist: ${result.id}`);
                form.reset(); // Formular zurücksetzen
            } else {
                const error = await response.json();
                alert(`Fehler: ${error.nachricht}`);
            }
        } catch (error) {
            console.error('Netzwerkfehler:', error);
            alert('Es gab ein Problem mit der Verbindung zum Server. Bitte versuchen Sie es später erneut.');
        }*/

        $.ajax({
            url: 'http://localhost:8000/api/kundenservice',
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            data: JSON.stringify(data)
        }).done(function (response) {
            if (response.ok) {
                alert(`Vielen Dank für Ihr Feedback! Ihre ID ist: ${result.id}`);
                form.reset(); // Formular zurücksetzen
            } else {
                alert(`Fehler: ${error.nachricht}`);
            }
        }).fail(function (jqXHR, statusText, error) {
            console.log('Token is invalid -> jump to login page');
            console.log('Response Code: ' + jqXHR.status + ' - Fehlermeldung: ' + jqXHR.responseText);
        });
    });
});
