$(document).ready(function() { // Wartet, bis das DOM vollständig geladen ist

    // AJAX-Request an die API zum Abrufen der Transaktionsdaten
    $.ajax({
        url: 'http://localhost:8000/api/transaktion/vonBenutzer', // API-Endpunkt für Transaktionen
        method: 'get', // HTTP-Methode: GET
        contentType: 'application/json; charset=utf-8', // Der Inhaltstyp der Anfrage
        cache: false, // Cache deaktivieren
        dataType: 'json', // Antwort erwartet im JSON-Format
        headers: getAuthorizationObject() // Fügt Authentifizierungstoken in die Header ein
    }).done(function (response) {
        // Wenn die Anfrage erfolgreich war, wird die Antwort verarbeitet
        console.log('Received response', response);

        // Container für die Anzeige der Transaktions-Buttons
        const recentContainer = document.getElementById("recentTransactions"); // Letzte 5 Transaktionen
        const allContainer = document.getElementById("allTransactionList"); // Weitere Transaktionen

        // Container leeren, bevor neue Daten eingefügt werden
        recentContainer.innerHTML = "";
        allContainer.innerHTML = "";

        // Letzte 5 Transaktionen anzeigen
        response.slice(0, 5).forEach(transaction => {
            const button = createTransactionButton(transaction); // Button für jede Transaktion erstellen
            recentContainer.appendChild(button); // Button in den Container einfügen
        });

        // Weitere Transaktionen anzeigen
        response.slice(5).forEach(transaction => {
            const button = createTransactionButton(transaction);
            allContainer.appendChild(button);
        });
    })
    .fail(function (jqXHR, statusText, error) {
        // Fehlerbehandlung für den AJAX-Request
        if (jqXHR.status == 401) { // Fehler 401: Token ungültig oder abgelaufen
            console.log('Token validation failed');
            jumpToLogin(); // Benutzer wird auf die Login-Seite weitergeleitet
        } else {
            // Allgemeine Fehlerbehandlung
            console.log('Response Code: ' + jqXHR.status + ' - Fehlermeldung: ' + jqXHR.responseText);
            alert('Es ist ein Fehler aufgetreten'); // Fehlermeldung anzeigen
        }
    });



    // Hilfsfunktion: Button für eine Transaktion erstellen
    function createTransactionButton(transaction) {
        const button = document.createElement("button"); // Erstelle ein Button-Element
        button.type = "button";
        button.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
        button.setAttribute("data-toggle", "modal"); // Bootstrap-Modal öffnen
        button.setAttribute("data-target", "#editTransactionModal"); // Ziel-Modal festlegen

        // Bestimme die Badge-Farbe abhängig vom Wert der Transaktion
        const badgeClass = transaction.wert < 0 ? "badge-danger" : "badge-success";
        const badgeText = `${transaction.wert < 0 ? "-" : "+"}${Math.abs(transaction.wert).toFixed(2)} €`;

        // Button-Inhalt: Notiz + Betrag der Transaktion
        button.innerHTML = `
            <span>${transaction.notiz || "Transaktion " + transaction.id}</span>
            <span class="badge ${badgeClass}">${badgeText}</span>
        `;

        // Event-Listener: Beim Klick öffne das Bearbeitungs-Modal und fülle die Felder
        button.addEventListener("click", () => {
            openEditModal(transaction);
        });

        return button; // Rückgabe des erstellten Buttons
    }




    // Funktion: Modal öffnen und Transaktionsdaten in die Felder einfügen
    function openEditModal(transaction) {
        // Fülle die Eingabefelder mit den Transaktionsdaten
        document.getElementById("wert").value = transaction.wert || 0;
        document.getElementById("editNotiz").value = transaction.notiz || "";
        document.getElementById("editDatum").value = transaction.transaktions_datum || "";
        document.getElementById("editKategorie").value = transaction.kategorie.name || "Sonstiges";

        // Event-Listener für Speichern-Button
        document.getElementById("saveBtn").addEventListener("click", () => {
            // Validierung starten
            if (validateForm()) {
                const updatedTransaction = {
                    id: transaction.id,
                    wert: parseFloat(document.getElementById("wert").value),
                    notiz: document.getElementById("editNotiz").value,
                    datum: document.getElementById("editDatum").value,
                    kategorie: document.getElementById("editKategorie").value
                };

                console.log("Gespeicherte Transaktion:", updatedTransaction);

                // Optional: API-Aufruf zum Aktualisieren
                console.log("Bearbeitungs-Modal schließen...");
                //$('#editTransactionModal').modal('hide'); funktioniert nicht
                $('#speichernModal').modal('show');
            }
        });
    }



    // Event-Listener: Löschen-Button
    document.getElementById("deleteBtn").addEventListener("click", () => {
        $('#editTransactionModal').modal('hide'); // Schließe das Bearbeitungs-Modal
        $('#deleteTransactionModal').modal('show'); // Zeige das Bestätigungs-Modal zum Löschen

        // Löschen der Transaktion nach Bestätigung
        document.querySelector("#deleteTransactionModal .btn-danger").onclick = () => {
            console.log(`Transaktion ${transaction.id} wurde gelöscht.`);

            // Optional: API-Aufruf zum Löschen der Transaktion hinzufügen
            $('#deleteTransactionModal').modal('hide'); // Bestätigungs-Modal schließen

            // Optional: Aktualisierung der Transaktionsliste
            displayTransactions();
        };
    });
});