$(document).ready(function () {
    // "Ein-/Ausgabe"-Button geklickt
    $("#einAusButton").on("click", function () {
        // Eingabewerte erfassen
        const bankkontoId = $("#konto").val();    // ID oder Name des Kontos aus dem Select
        const kategorieId = $("#kategorie").val(); 
        const wert = parseFloat($("#wert").val());
        const transaktionsDatum = $("#datum").val();
        const notiz = $("#notiz").val();
        // Radio-Button auslesen ('ausgabe' oder 'einnahme')
        const typ = $("input[name='trans_type']:checked").attr("id"); 

        // Validierung
        if (!wert || wert <= 0 || isNaN(wert)) {
            $("#answer").text("Bitte einen gültigen Wert eingeben.");
            return;
        }

        // AJAX-Request an dein Backend
        $.ajax({
            url: "http://localhost:8000/api/transaktion",
            method: "POST",
            contentType: "application/json; charset=utf-8",
            headers: getAuthorizationObject(), // Deine Token-Funktion
            data: JSON.stringify({
                bankkonto_id_von: bankkontoId, 
                bankkonto_id_nach: null,        // Bei Ausgabe/Einnahme meist leer
                kategorie_id: kategorieId,
                wert: wert,
                transaktions_datum: transaktionsDatum,
                notiz: notiz,
                typ: typ
            })
        })
        .done(function (response) {
            // Erfolg: z.B. ein Modal anzeigen
            console.log("Transaktion erfolgreich erstellt:", response);
            $("#hinzufuegenModal").modal("show");
            // Optional: Konten neu laden, falls du sie auf derselben Seite anzeigen willst
            // loadKonten() oder so
        })
        .fail(function (xhr, status, error) {
            // Fehlerbehandlung
            $("#answer").text("Fehler beim Hinzufügen der Transaktion: " + error);
        });
    });
    
    // Umbuchung
    $("#umbuchungButton").on("click", function () {
        // Eingabewerte erfassen
        const bankkontoIdVon = $("#konto1").val();
        const bankkontoIdNach = $("#konto2").val();
        const wert = parseFloat($("#wertUmbuchung").val());
        const transaktionsDatum = $("#datumUmbuchung").val();
        const notiz = $("#notizUmbuchung").val();

        // Validierung
        if (!wert || wert <= 0 || isNaN(wert)) {
            $("#answer").text("Bitte einen gültigen Wert für die Umbuchung eingeben.");
            return;
        }
        if (bankkontoIdVon === bankkontoIdNach) {
            $("#answer").text("Von- und Zielkonto dürfen nicht identisch sein.");
            return;
        }

        // AJAX-Request
        $.ajax({
            url: "http://localhost:8000/api/transaktion",
            method: "POST",
            contentType: "application/json; charset=utf-8",
            headers: getAuthorizationObject(),
            data: JSON.stringify({
                bankkonto_id_von: bankkontoIdVon,
                bankkonto_id_nach: bankkontoIdNach,
                kategorie_id: 6,        // Umbuchungen haben evtl. keine Kategorie
                wert: wert,
                transaktions_datum: transaktionsDatum,
                notiz: notiz,
                typ: "umbuchung"
            })
        })
        .done(function (response) {
            console.log("Umbuchung erfolgreich erstellt:", response);
            $("#hinzufuegenModal").modal("show");
        })
        .fail(function (xhr, status, error) {
            $("#answer").text("Fehler beim Hinzufügen der Umbuchung: " + error);
        });
    });

});
