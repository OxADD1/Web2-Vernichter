$(document).ready(function () {
  // API-URL Konstante
  const apiUrl = "http://localhost:8000/api/transaktion/vonBenutzer";

  // Transaktionsliste laden
  function loadTransactions() {
    $.ajax({
      url: apiUrl,
      method: "GET",
      contentType: "application/json; charset=utf-8",
      cache: false,
      dataType: "json",
      headers: getAuthorizationObject(), // Token für Authentifizierung
    })
      .done(displayTransactions)
      .fail(handleAjaxError);
  }

  // Anzeige der Transaktionen
  function displayTransactions(response) {
    console.log("Received response:", response);

    const recentContainer = document.getElementById("recentTransactions");
    const allContainer = document.getElementById("allTransactionList");

    recentContainer.innerHTML = "";
    allContainer.innerHTML = "";

    //reverse um letzten 5 anzuzeigen udne tc
    const reversed = [...response].reverse();

    // Buttons erstellen und einfügen
    //response.slice(0, 5).forEach(transaction => recentContainer.appendChild(createTransactionButton(transaction)));
    // response.slice(5).forEach(transaction => allContainer.appendChild(createTransactionButton(transaction)));
    reversed
      .slice(0, 5)
      .forEach((transaction) =>
        recentContainer.appendChild(createTransactionButton(transaction))
      );
    reversed
      .slice(5)
      .forEach((transaction) =>
        allContainer.appendChild(createTransactionButton(transaction))
      );
  }

  // Fehlerbehandlung für AJAX
  function handleAjaxError(jqXHR) {
    if (jqXHR.status === 401) {
      console.log("Token validation failed");
      jumpToLogin(); // Bei ungültigem Token weiterleiten
    } else {
      console.error("Error: " + jqXHR.responseText);
      alert("Es ist ein Fehler aufgetreten");
    }
  }

  // Transaktions-Button erstellen
function createTransactionButton(transaction) {
    const button = document.createElement("button");
    button.className =
      "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
    button.setAttribute("data-toggle", "modal");
    button.setAttribute("data-target", "#editTransactionModal");
  
    // 1) Typ-basiertes Vorzeichen (und Farbe)
    let sign = "";
    let badgeClass = "badge-secondary"; // Fallback, z.B. grau
  
    if (transaction.typ === "ausgabe") {
      sign = "-";
      badgeClass = "badge-danger";
    } else if (transaction.typ === "einnahme") {
      sign = "+";
      badgeClass = "badge-success";
    } else if (transaction.typ === "umbuchung") {
      // Umbuchungen kann man z. B. neutral anzeigen
      sign = ""; 
      badgeClass = "badge-warning"; 
    }
  
    // 2) Formatierung des Betrags
    const formattedAmount = `${sign}${Math.abs(transaction.wert).toFixed(2)} €`;
  
    // 3) Button-Inhalt
    button.innerHTML = `
      <span>${transaction.notiz || "Transaktion " + transaction.id}</span>
      <span class="badge ${badgeClass}">${formattedAmount}</span>
    `;
  
    // 4) Klick-Event für das Bearbeiten
    button.addEventListener("click", () => openEditModal(transaction));
    
    return button;
  }
  

  // Modal für Bearbeiten öffnen
  function openEditModal(transaction) {
    document.getElementById("wert").value = transaction.wert || 0;
    document.getElementById("editNotiz").value = transaction.notiz || "";
    document.getElementById("editDatum").value =
      transaction.transaktions_datum || "";
    document.getElementById("editKategorie").value =
      transaction.kategorie.name || "Sonstiges";

    // Speichern-Button
    $("#saveBtn")
      .off("click")
      .on("click", function () {
        if (validateForm()) {
          const updatedTransaction = {
            id: transaction.id,
            wert: parseFloat($("#wert").val()),
            notiz: $("#editNotiz").val(),
            datum: $("#editDatum").val(),
            kategorie: $("#editKategorie").val(),
          };
          console.log("Gespeicherte Transaktion:", updatedTransaction);
          $("#editTransactionModal").modal("hide"); // Schließe Modal
          saveTransaction(updatedTransaction); // Speichern der Änderungen
        }
      });

    // Löschen-Button
    $("#deleteBtn")
      .off("click")
      .on("click", function () {
        $("#editTransactionModal").modal("hide");
        $("#deleteTransactionModal").modal("show");
        $("#confirmDeleteBtn")
          .off("click")
          .on("click", function () {
            deleteTransaction(transaction.id);
          });
      });
  }

  // Speichern der Transaktion
  function saveTransaction(transaction) {
    $.ajax({
      url: "http://localhost:8000/api/transaktion/update",
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(transaction),
      headers: getAuthorizationObject(),
    })
      .done(() => {
        alert("Transaktion erfolgreich aktualisiert!");
        loadTransactions(); // Aktualisierte Transaktionen laden
      })
      .fail(handleAjaxError);
  }

  // Löschen der Transaktion
  function deleteTransaction(id) {
    $.ajax({
      url: `http://localhost:8000/api/transaktion/delete/${id}`,
      method: "DELETE",
      headers: getAuthorizationObject(),
    })
      .done(() => {
        alert("Transaktion gelöscht!");
        $("#deleteTransactionModal").modal("hide");
        loadTransactions(); // Aktualisierte Transaktionen laden
      })
      .fail(handleAjaxError);
  }

  // Lade Transaktionen beim Laden der Seite
  loadTransactions();
});
