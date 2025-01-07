$(document).ready(function() {
    console.log("Starte AJAX-Request für Konten...");

    /**
     * Lädt alle Konten des angemeldeten Benutzers vom Server.
     * Erwartet ein JSON-Array von Konto-Objekten.
     * Bei Erfolg werden die Konten in #accounts-container angezeigt.
     */
    function loadKonten() {
        console.log("Rufe /api/bankkonto/alle auf...");
        $.ajax({
            url: 'http://localhost:8000/api/bankkonto/alle', // Endpunkt für alle Konten
            method: 'GET', // HTTP-Methode GET
            contentType: 'application/json; charset=utf-8', // Antwortformat
            cache: false, // Deaktiviert Caching
            dataType: 'json', // Antworttyp JSON
            headers: getAuthorizationObject() // Authentifizierung über Token
        }).done(function(response) {
            console.log('Konten geladen:', response);

            // Löscht vorherigen Inhalt, bevor neue Konten hinzugefügt werden
            $('#accounts-container').empty();

            // Iteriert durch das Konto-Array und zeigt jedes Konto an
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

    // Ruft direkt beim Laden der Seite die Konten ab
    loadKonten();

    /**
     * Klick-Handler für den "Konto hinzufügen"-Button.
     * Schickt die Formulardaten per POST an den Server.
     */
    $('#hinzufuegenButton').on('click', function() {
        const kontoname = $('#accountName').val().trim();
        const kontostand = $('#wert').val().trim();
        const iban = $('#accountIBANadd').val().trim();

        console.log("Konto hinzufügen:", { kontoname, kontostand, iban });

        // Validierung, ob alle Felder ausgefüllt sind
        if (!kontoname || !kontostand) {
            alert('Bitte alle Felder ausfüllen');
            return;
        }

        // POST-Request an den Server zum Hinzufügen eines neuen Kontos
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
            document.getElementById('addAccountForm2').reset(); // Formular zurücksetzen
            loadKonten(); // Liste neu laden
        }).fail(function(jqXHR) {
            console.error("Fehler beim Hinzufügen des Kontos:", jqXHR.responseText);
        });
    });

    /**
     * Klick-Handler für den "Bearbeiten"-Button.
     * Lädt Kontodaten vom Server und befüllt das Bearbeitungs-Modal.
     */
    $(document).on('click', '.editKontoButton', function() {
        const id = $(this).data('konto-id'); // Konto-ID aus data-Attribut
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
            headers: getAuthorizationObject()
        }).done(function(konto) {
            console.log("Kontodaten für Bearbeitung geladen:", konto);

            // Befüllt die Felder im Bearbeitungs-Modal
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
     * Schickt die geänderten Werte per PUT an den Server.
     */
    $('#editSaveButton').on('click', function() {
        const id = $('#editKontoId').val().trim();
        const kontoname = $('#editKontoLabel').val().trim();
        const kontostand = $('#editWert').val().trim();
        const iban = $('#accountIBANedit').val().trim();

        console.log("Bearbeitete Daten:", { id, kontoname, kontostand, iban });

        if (!id || !kontoname || !kontostand) {
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
            document.getElementById('editKontoForm').reset(); // Formular zurücksetzen
            loadKonten(); // Liste neu laden
        }).fail(function(jqXHR) {
            console.error("Fehler beim Bearbeiten des Kontos:", jqXHR.responseText);
            alert('Fehler beim Bearbeiten des Kontos: ' + jqXHR.responseText);
        });
    });

    /**
     * Klick-Handler für den "Löschen"-Button.
     * Zeigt das Lösch-Modal an und führt bei Bestätigung den DELETE-Request aus.
     */
    $(document).on('click', '.deleteKontoButton', function() {
        const id = $(this).data('konto-id');
        if (!id) {
            alert('Konten-ID nicht gefunden.');
            return;
        }

        console.log("Löschen geklickt für Konto mit ID:", id);

        // DELETE-Request bei Bestätigung
        $('#deleteConfirmButton').off('click').on('click', function() {
            $.ajax({
                url: 'http://localhost:8000/api/bankkonto/' + id,
                method: 'DELETE',
                cache: false,
                dataType: 'json',
                headers: getAuthorizationObject()
            }).done(function(response) {
                loadKonten(); // Liste neu laden
                $('#deleteKontoModal').modal('hide'); // Modal schließen
            }).fail(function(jqXHR) {
                console.error("Fehler beim Löschen des Kontos:", jqXHR.responseText);
                alert('Fehler beim Löschen des Kontos: ' + jqXHR.responseText);
            });
        });
    });
});
