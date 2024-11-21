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

        // Eingabedaten validieren
        if (!name || !email || !nachricht) {
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

        try {
            // AJAX-Request: Daten an das Backend senden
            const response = await fetch('http://localhost:8000/api/kundenservice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    typ: type, // 'feedback' oder 'problem'
                    anrede: anrede,    // z.B. 'Herr' oder 'Frau'
                    name: name,        // Eingabe aus dem Formular
                    email: email,      // Eingabe aus dem Formular
                    nachricht: nachricht // Eingabe aus dem Formular
                })
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
        }
    });
});
