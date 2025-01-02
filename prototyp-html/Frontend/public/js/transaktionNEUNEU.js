$(document).ready(function () {
  const API_URL = "http://localhost:8000/api/transaktion";

  // >>> Hier globale Variable für das Gesamtvermögen anlegen
  let globalGesamtvermoegen = 0;

  // ----------------------------------------------------------
  // Funktion: Gesamtvermögen laden
  // ----------------------------------------------------------
  function loadGesamtvermoegen() {
    return $.ajax({
      url: "http://localhost:8000/api/bankkonto/gesamtvermoegen",
      method: "GET",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      headers: getAuthorizationObject(),
    })
      .done(function (response) {
        console.log("Gesamtvermögen geladen:", response.gesamtvermoegen);

        // Merken in globaler Variable
        globalGesamtvermoegen = response.gesamtvermoegen;

        // Auf der Seite anzeigen
        $("#balanceAmount").text(response.gesamtvermoegen.toFixed(2) + " €");
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        console.error("Fehler beim Laden des Gesamtvermögens:", errorThrown);
      });
  }

  // ----------------------------------------------------------
  // 1) Transaktionen laden
  // ----------------------------------------------------------
  function loadTransactions() {
    $.ajax({
      url: `${API_URL}/vonBenutzer`,
      method: "GET",
      contentType: "application/json; charset=utf-8",
      cache: false,
      dataType: "json",
      headers: getAuthorizationObject(), // Token-Funktion
    })
      .done(displayTransactions)
      .fail(handleAjaxError);
  }

  // ----------------------------------------------------------
  // 2) Anzeige der Transaktionen
  //    (die letzten 5 + restliche) und Diagramm aktualisieren
  // ----------------------------------------------------------
  function displayTransactions(response) {
    console.log("Received response:", response);

    const recentContainer = document.getElementById("recentTransactions");
    const allContainer = document.getElementById("allTransactionList");
    recentContainer.innerHTML = "";
    allContainer.innerHTML = "";

    // Neueste zuerst anzeigen
    const reversed = [...response].reverse();
    reversed
      .slice(0, 5)
      .forEach((t) => recentContainer.appendChild(createTransactionButton(t)));
    reversed
      .slice(5)
      .forEach((t) => allContainer.appendChild(createTransactionButton(t)));

    // Ausgaben summieren und Diagramm aktualisieren
    // ACHTUNG: "Einnahmen" wird jetzt = globalGesamtvermoegen
    // --> 1) "Gesamt-Diagramm" updaten (wie gehabt)
    updateCapitalDiagram(response);

    // --> 2) Ausgaben nach Kategorien aufbereiten
    const { labels, data } = buildCategoryData(response);

    // --> 3) Neues Kategorie-Diagramm anzeigen
    updateCategoryChart(labels, data);
  }

  // ----------------------------------------------------------
  // 3) Funktion, um Ausgaben zu summieren und Diagramm zu erstellen
  // ----------------------------------------------------------
  function updateCapitalDiagram(transactions) {
    // "Einnahmen" kommt von globalGesamtvermoegen!
    let totalIncome = globalGesamtvermoegen;
    let totalExpenses = 0;

    // Summieren der Ausgaben
    transactions.forEach((t) => {
      if (t.typ === "ausgabe") {
        totalExpenses += Math.abs(t.wert);
      }
    });

    // 2) Im <p>-Element anzeigen
    const expenseCategoryElement = document.getElementById("expenseCategory");
    expenseCategoryElement.textContent = totalExpenses.toFixed(2) + " €";

    // Diagramm aktualisieren / erstellen
    updateCapitalChart(totalIncome, totalExpenses);
  }

  // ----------------------------------------------------------
  // 4) Doughnut-Diagramm erstellen / aktualisieren
  // ----------------------------------------------------------
  let capitalChart;
  function updateCapitalChart(income, expenses) {
    const canvas = document.getElementById("capitalCanvas");
    if (!canvas) {
      console.error("capitalChart-Canvas nicht gefunden!");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!capitalChart) {
      // Erstes Mal erstellen
      capitalChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Einnahmen", "Ausgaben"],
          datasets: [
            {
              data: [income, expenses],
              backgroundColor: ["#28a745", "#dc3545"],
            },
          ],
        },
      });
    } else {
      // Nur Daten updaten
      capitalChart.data.datasets[0].data = [income, expenses];
      capitalChart.update();
    }
  }

  ///////////////////////////////////////
  // A) Ausgaben pro Kategorie summieren
  ///////////////////////////////////////
  function buildCategoryData(transactions) {
    // Ein Objekt zum Gruppieren nach Kategorien
    const categorySums = {};

    transactions.forEach((t) => {
      // Nur Ausgaben mitnehmen
      if (t.typ === "ausgabe") {
        // Kategorie-Name aus dem Transaktionsobjekt
        // Wenn kategorie fehlt, fallback "Sonstiges"
        const catName =
          t.kategorie && t.kategorie.name ? t.kategorie.name : "Sonstiges";

        if (!categorySums[catName]) {
          categorySums[catName] = 0;
        }
        // Addiere den Betrag (positiv) hinzu
        categorySums[catName] += Math.abs(t.wert);
      }
    });

    // Jetzt haben wir so etwas wie:
    // { "Miete": 450, "Essen": 120, "Reisen": 70, ... }

    // Für Chart.js brauchen wir zwei Arrays: labels und data
    const labels = Object.keys(categorySums);
    const data = Object.values(categorySums);

    return { labels, data };
  }

  ///////////////////////////////////////
  // B) Ein weiteres Chart für Kategorien
  ///////////////////////////////////////
  let categoryChart; // globale oder modulweite Variable

  function updateCategoryChart(labels, data) {
    // Das neue Canvas-Element im DOM
    const canvas2 = document.getElementById("categoryChart");
    if (!canvas2) {
      console.error("Canvas für Kategorie-Chart nicht gefunden!");
      return;
    }

    const ctx = canvas2.getContext("2d");

    if (!categoryChart) {
      // Erstes Mal: neues Chart-Objekt erstellen
      categoryChart = new Chart(ctx, {
        type: "doughnut", // oder "pie", "bar", ...
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: [
                // Einfach ein paar Farben:
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
                // Du kannst beliebig viele definieren,
                // oder sogar dynamisch generieren
              ],
            },
          ],
        },
      });
    } else {
      // Diagramm updaten, wenn schon erstellt
      categoryChart.data.labels = labels;
      categoryChart.data.datasets[0].data = data;
      categoryChart.update();
    }
  }

  // ----------------------------------------------------------
  // 5) Transaktions-Button erstellen
  // ----------------------------------------------------------
  function createTransactionButton(transaction) {
    const button = document.createElement("button");
    button.className =
      "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
    button.setAttribute("data-toggle", "modal");
    button.setAttribute("data-target", "#editTransactionModal");

    let sign = "";
    let badgeClass = "badge-secondary";

    if (transaction.typ === "ausgabe") {
      sign = "-";
      badgeClass = "badge-danger";
    } else if (transaction.typ === "einnahme") {
      sign = "+";
      badgeClass = "badge-success";
    } else if (transaction.typ === "umbuchung") {
      badgeClass = "badge-warning";
    }

    const formattedAmount = `${sign}${Math.abs(transaction.wert).toFixed(2)} €`;
    button.innerHTML = `
        <span>${transaction.notiz || "Transaktion " + transaction.id}</span>
        <span class="badge ${badgeClass}">${formattedAmount}</span>
      `;

    button.addEventListener("click", () => openEditModal(transaction));
    return button;
  }

  // ----------------------------------------------------------
  // 6) Modal öffnen (Bearbeiten / Löschen)
  // ----------------------------------------------------------
  function openEditModal(transaction) {
    document.getElementById("wert").value = transaction.wert || 0;
    document.getElementById("editNotiz").value = transaction.notiz || "";
    document.getElementById("editDatum").value =
      transaction.transaktions_datum || "";
    document.getElementById("editKategorie").value =
      transaction.kategorie?.name || "Sonstiges";

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
          $("#editTransactionModal").modal("hide");
          saveTransaction(updatedTransaction);
        }
      });

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

  // ----------------------------------------------------------
  // 7) Speichern (PUT)
  // ----------------------------------------------------------
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
        loadTransactions();
      })
      .fail(handleAjaxError);
  }

  // ----------------------------------------------------------
  // 8) Löschen (DELETE)
  // ----------------------------------------------------------
  function deleteTransaction(id) {
    $.ajax({
      url: `http://localhost:8000/api/transaktion/delete/${id}`,
      method: "DELETE",
      headers: getAuthorizationObject(),
    })
      .done(() => {
        alert("Transaktion gelöscht!");
        $("#deleteTransactionModal").modal("hide");
        loadTransactions();
      })
      .fail(handleAjaxError);
  }

  // ----------------------------------------------------------
  // 9) Fehler-Handler
  // ----------------------------------------------------------
  function handleAjaxError(jqXHR) {
    if (jqXHR.status === 401) {
      console.log("Token validation failed");
      jumpToLogin(); // Bei ungültigem Token
    } else {
      console.error("Error: " + jqXHR.responseText);
      alert("Es ist ein Fehler aufgetreten");
    }
  }

  // ----------------------------------------------------------
  // 10) Filtern-Button
  // ----------------------------------------------------------
  $("#filterBtn").on("click", function () {
    const startDate = $("#startDate").val();
    const endDate = $("#endDate").val();
    const category = $("#categoryFilter").val();
    // Hier ggf. Filter-Logik
    loadTransactions();
  });

  // ----------------------------------------------------------
  // 11) Beim Laden der Seite:
  //     1) Gesamtvermögen laden
  //     2) Danach Transaktionen laden
  // ----------------------------------------------------------
  loadGesamtvermoegen().then(() => {
    // Erst wenn Gesamtvermögen geladen ist, Transaktionen holen:
    loadTransactions();
  });
});