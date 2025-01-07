document.addEventListener("DOMContentLoaded", function () {
    setupValidation("wert", "error-message");
    setupValidation("editWert", "error-message-edit");
});

// Allgemeine Validierungsfunktion
function setupValidation(inputId, errorId) {
    const inputField = document.getElementById(inputId);
    const errorMessage = document.getElementById(errorId);

    if (!inputField) {
        console.warn(`Eingabefeld mit der ID "${inputId}" existiert nicht.`);
        return;
    }

    if (!errorMessage) {
        console.warn(`Fehlerausgabe-Element mit der ID "${errorId}" existiert nicht.`);
        return;
    }

    inputField.addEventListener("input", function (e) {
        let value = e.target.value;

        // Eingabe korrigieren
        if (!/^\d*\.?\d{0,2}$/.test(value)) {
            e.target.value = value.slice(0, -1); // Letztes Zeichen entfernen
        }

        // Fehlerstatus setzen
        if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
            inputField.classList.remove("invalid-input");
            errorMessage.style.display = "none";
        } else {
            inputField.classList.add("invalid-input");
            errorMessage.style.display = "block";
        }
    });

    // Verhindern, dass mehrere Punkte eingegeben werden
    inputField.addEventListener("keydown", function (e) {
        if (e.key === "." && inputField.value.includes(".")) {
            e.preventDefault();
        }
    });
}


function validateInput(inputId, modalId) {
    const input = document.getElementById(inputId).value;
    const regex = /^\d+(\.\d{1,2})?$/;

    if (!regex.test(input)) {
        const divElement = document.getElementById("answer");
        divElement.textContent = "Bitte geben Sie einen gültigen Wert mit maximal zwei Nachkommastellen an"
    } else {
        // Zeige das entsprechende Modal
        $(`#${modalId}`).modal("show");
        console.log("Formular wurde abgeschickt!");
        //document.getElementById(formId).reset();
    }
}
