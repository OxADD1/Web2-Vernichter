$(document).ready(function () {
    // Token und Sessiondaten über Session-Handling abrufen
    const credentials = getJSONSessionItem('credentials'); // Nutzt deine Funktion getJSONSessionItem
    if (!credentials || !credentials.token) {
        showPopup('error', 'Sie müssen eingeloggt sein, um dieses Formular zu nutzen.');
        setTimeout(() => {
            window.location.href = '../login.html'; // Weiterleitung zur Login-Seite
        }, 3000);
        return;
    }

    const token = credentials.token; // Token aus den abgerufenen Credentials

    // Formular absenden
    $('#feedbackForm').on('submit', function (event) {
        event.preventDefault(); // Standardformular-Aktion verhindern

        // Formulardaten sammeln
        const typ = $('input[name="feedback_type"]:checked').val();
        const anrede = $('#anrede').val();
        const name = $('#name').val().trim();
        const email = $('#email').val().trim();
        const nachricht = $('#nachricht').val().trim();

        // Validierung der Eingaben
        if (!typ || !anrede || !name || !email || !nachricht) {
            showPopup('error', 'Bitte füllen Sie alle Felder aus.');
            return;
        }

        console.log("Ausgewählter Typ:", $('input[name="feedback_type"]:checked').val());

        // Payload erstellen
        const payload = {
            typ: typ,
            anrede: anrede,
            name: name,
            email: email,
            nachricht: nachricht
        };

        // AJAX-Anfrage
        $.ajax({
            url: 'http://localhost:8000/api/kundenservice',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Token im Header mitgeben
            },
            data: JSON.stringify(payload),
            success: function (response) {
                showPopup('success', 'Ihre Nachricht wurde erfolgreich gesendet.');
                $('#feedbackForm').trigger('reset'); // Formular zurücksetzen
            },
            error: function (jqXHR) {
                const errorMessage = jqXHR.responseText || 'Ein Problem ist aufgetreten.';
                showPopup('error', `Fehler: ${errorMessage}`);
                console.error('Fehlerdetails:', jqXHR);
            }
        });
    });

    // Funktion zum Anzeigen eines Popups
    function showPopup(type, message) {
        const popup = type === 'success' ? $('#successMessage') : $('#errorMessage');

        // Nachricht im Popup setzen
        popup.find('.popup-body').text(message);

        // Popup sichtbar machen
        popup.fadeIn();

        // Nach 3 Sekunden automatisch ausblenden
        setTimeout(() => {
            popup.fadeOut();
        }, 3000);
    }

    // Funktion zum manuellen Schließen des Popups
    window.closePopup = function (popupId) {
        $(`#${popupId}`).fadeOut();
    };
});
