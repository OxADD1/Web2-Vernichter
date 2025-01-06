$(document).ready(function() {
    console.log("Starte AJAX-Request für Konten...");

    /**
     * Lädt alle Konten des angemeldeten Benutzers vom Server.
     * Erwartet vom Server ein JSON-Array von Konto-Objekten.
     * Bei Erfolg werden die Konten in #accounts-container angezeigt.
     */
    function loadKonten() {
        console.log("Rufe /api/bankkonto/alle auf...");
        $.ajax({
            url: 'http://localhost:8000/api/bankkonto/alle',
            method: 'GET',
            contentType: 'application/json; charset=utf-8',
            cache: false,
            dataType: 'json',
            headers: getAuthorizationObject() // Hier wird der Token für Auth mitgeschickt
        }).done(function(response) {
            console.log('Konten geladen:', response);

            // Inhalt leeren, bevor neu hinzugefügt wird
            $('#accounts-container').empty();

            // Über das Array iterieren und jedes Konto anzeigen
            response.forEach(function(konto) {
                $('#accounts-container').append(`
                    <div class="account-entry">
                        <span>${konto.kontoname}</span>
                        <div class="account-options">
                            <span class="balance-amount">${konto.kontostand}€</span>
                            <button class="btn btn-danger btn-sm deleteKontoButton" 
                                data-konto-id="${konto.id}" data-toggle="modal" 
                                data-target="#deleteKontoModal">Löschen</button>
                            <button class="btn btn-info btn-sm editKontoButton" 
                                data-konto-id="${konto.id}" data-toggle="modal" 
                                data-target="#editKontoModal">Bearbeiten</button>
                        </div>
                    </div>
                `);
            });
        }).fail(function(jqXHR) {
            console.error("Fehler beim Laden der Konten:", jqXHR.responseText);
            alert('Fehler beim Laden der Konten: ' + jqXHR.responseText);
        });
    }

    // Beim Laden der Seite sofort die Konten holen
    loadKonten();

    /**
     * Klick-Handler für den "Konto hinzufügen"-Button.
     * Liest die Daten aus den entsprechenden Input-Feldern aus und schickt sie per POST an den Server.
     */
    $('#hinzufuegenButton').on('click', function() {
        const kontoname = $('#accountName').val().trim();
        const kontostand = $('#wert').val().trim();
        const iban = $('#accountIBANadd').val().trim();

        console.log("Konto hinzufügen:", {kontoname, kontostand, iban});

        // Validierung, ob alle Felder ausgefüllt sind
        if(!kontoname || !kontostand || !iban) {
            alert('Bitte alle Felder ausfüllen');
            return;
        }

        // POST-Request an den Server, um ein neues Konto anzulegen
        $.ajax({
            url: 'http://localhost:8000/api/bankkonto',
            method: 'POST',
            cache: false,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            headers: getAuthorizationObject(),
            data: JSON.stringify({ kontoname: kontoname, kontostand: kontostand, iban: iban })
        }).done(function(response) {
            console.log("Konto erstellt:", response);
            document.getElementById('addAccountForm2').reset();
            //alert('Konto erfolgreich hinzugefügt.');
            // Liste neu laden, um das neue Konto anzuzeigen
            loadKonten();
        }).fail(function(jqXHR) {
            console.error("Fehler beim Hinzufügen des Kontos:", jqXHR.responseText);
            //alert('Fehler beim Hinzufügen des Kontos: ' + jqXHR.responseText);
        });
    });


    /**
     * Event-Delegation für den "Bearbeiten"-Button.
     * Wird geklickt, wenn ein Konto bearbeitet werden soll.
     * Lädt die spezifischen Kontodaten vom Server und füllt das Bearbeitungs-Modal damit.
     */
    $(document).on('click', '.editKontoButton', function() {
        const id = $(this).data('konto-id'); // Liest die Konto-ID aus data-Attribut
        if (!id) {
            alert('Fehler: Konto-ID fehlt.');
            return;
        }

        console.log("Bearbeiten geklickt für Konto mit ID:", id);

        // GET-Request zum Laden der Kontodaten
        $.ajax({
            url: `http://localhost:8000/api/bankkonto/gib/${id}`,
            method: 'GET',
            dataType: 'json',
            headers: getAuthorizationObject(),
        }).done(function(konto) {
            console.log("Kontodaten für Bearbeitung geladen:", konto);

            // Felder im Modal mit den geladenen Daten befüllen
            $('#editKontoId').val(konto.id);
            $('#editKontoLabel').val(konto.kontoname);
            $('#editWert').val(konto.kontostand);
            $('#accountIBANedit').val(konto.iban);
        }).fail(function(jqXHR) {
            console.error("Fehler beim Laden des Kontos:", jqXHR.responseText);
            alert('Fehler beim Laden des Kontos: ' + jqXHR.responseText);
        });
    });

    /**
     * Klick-Handler für den "Speichern"-Button im Bearbeitungs-Modal.
     * Liest die geänderten Werte aus und schickt sie per PUT-Request an den Server.
     */
    $('#editSaveButton').on('click', function() {
        // Auslesen der aktuellen Werte aus dem Modal
        const id = $('#editKontoId').val().trim();
        const kontoname = $('#editKontoLabel').val().trim();
        const kontostand = $('#editWert').val().trim();
        const iban = $('#accountIBANedit').val().trim();

        console.log("Bearbeitete Daten:", {id, kontoname, kontostand, iban});

        // Eingabeprüfung
        if(!id || !kontoname || !kontostand || !iban) {
            alert('Bitte alle Felder ausfüllen');
            return;
        }

        // PUT-Request zum Aktualisieren des Kontos
        $.ajax({
            url: 'http://localhost:8000/api/bankkonto',
            method: 'PUT',
            cache: false,
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            headers: getAuthorizationObject(),
            data: JSON.stringify({ id: id, kontoname: kontoname, kontostand: kontostand, iban: iban })
        }).done(function(response) {
            //console.log("Konto erfolgreich aktualisiert:", response);
            //alert('Konto erfolgreich bearbeitet.');
            // Nach dem Bearbeiten die Liste aktualisieren
            document.getElementById('editKontoForm').reset();
            loadKonten();
        }).fail(function(jqXHR) {
            console.error("Fehler beim Bearbeiten des Kontos:", jqXHR.responseText);
            alert('Fehler beim Bearbeiten des Kontos: ' + jqXHR.responseText);
        });
    });


    /**
     * Event-Delegation für den "Löschen"-Button.
     * Wird geklickt, wenn ein Konto gelöscht werden soll.
     * Zeigt das Lösch-Modal an, und bei "Ja" wird der DELETE-Request ausgeführt.
     */
    $(document).on('click', '.deleteKontoButton', function() {
        const id = $(this).data('konto-id');
        if(!id) {
            alert('Konten-ID nicht gefunden.');
            return;
        }

        console.log("Löschen geklickt für Konto mit ID:", id);

        // Bei Klick auf "Ja" im Lösch-Modal den DELETE-Request senden
        $('#deleteConfirmButton').off('click').on('click', function() {
            $.ajax({
                url: 'http://localhost:8000/api/bankkonto/' + id,
                method: 'DELETE',
                cache: false,
                dataType: 'json',
                headers: getAuthorizationObject()
            }).done(function(response) {
                console.log("Konto gelöscht:", response);
                //alert('Konto erfolgreich gelöscht.');
                // Nach dem Löschen erneut Konten laden
                loadKonten();
                // Modal schließen
                $('#deleteKontoModal').modal('hide');
            }).fail(function(jqXHR) {
                console.error("Fehler beim Löschen des Kontos:", jqXHR.responseText);
                alert('Fehler beim Löschen des Kontos: ' + jqXHR.responseText);
            });
        });
    });
});
