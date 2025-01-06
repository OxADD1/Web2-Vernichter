const helper = require('../helper.js');
const TransaktionDao = require('../dao/transaktionDao.js');
const BankkontoDao = require('../dao/bankkontoDao.js');
const validateToken = require('../tokenHandling/validateToken.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Transaktion');

// hole alle transaktion vom benutzer
serviceRouter.get('/transaktion/vonBenutzer', validateToken, function(request, response) {
    // den check, ob der Token gesendet wurde und valide ist übernimmt die "middleware" 
    // validateToken. Siehe tokenHandling/validateToken.js
    // wenn der Token valide ist, wird die userId im request Objekt zur verfügung gestellt und kann hier genutzt werden

    console.log('Service Transaktion: Client requested all records for this userId', request.userId);
    const transaktionDao = new TransaktionDao(request.app.locals.dbConnection);
    try {
        var arr = transaktionDao.loadAllByUserId(request.userId);
        console.log('Transaktionen vom User' + arr);
        console.log('Service Transaktion: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Transaktion: Error loading all records for user. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});


// hole gefilterte Transaktionen vom Benutzer
serviceRouter.post('/transaktion/filtered', validateToken, function(request, response) {
    console.log('Service Transaktion: Client requests filtered transactions for userId=' + request.userId);

    const transaktionDao = new TransaktionDao(request.app.locals.dbConnection);

    let { startDatum, endDatum, kategorieId } = request.body;

    // Falls kein Datum ausgewählt wurde, nutze null
    if (!startDatum) startDatum = null;
    if (!endDatum)   endDatum   = null;
    // Wenn kein kategorieId => "Alle"
    if (!kategorieId) kategorieId = 'Alle';

    try {
        // Hier KORREKT aufsplitten statt ein Objekt zu übergeben:
        var result = transaktionDao.loadFiltered(
            request.userId,
            startDatum,
            endDatum,
            kategorieId
        );
        console.log('Service Transaktion: Filtered transactions loaded.');
        response.status(200).json(result);

    } catch (ex) {
        console.error('Service Transaktion: Error loading filtered transactions. Exception occurred: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});





// hole ausgaben nach kategorien
serviceRouter.get('/transaktion/ausgabenNachKategorie', validateToken, function(request, response) {
    console.log('Service Transaktion: Client requests expenses grouped by category for userId=' + request.userId);
    const transaktionDao = new TransaktionDao(request.app.locals.dbConnection);

    try {
        var result = transaktionDao.getExpenseByCategory(request.userId);
        console.log('Service Transaktion: Expenses by category loaded.');
        response.status(200).json(result);
    } catch (ex) {
        console.error('Service Transaktion: Error loading expenses by category. Exception occurred: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});


// hole aktueller kontostand ausgabe/einahme
serviceRouter.get('/transaktion/kontostand', validateToken, function(request, response) {
    console.log('Service Transaktion: Client requests current balance for userId=' + request.userId);
    const transaktionDao = new TransaktionDao(request.app.locals.dbConnection);

    try {
        var result = transaktionDao.getCurrentBalance(request.userId);
        console.log('Service Transaktion: Current balance loaded.');
        response.status(200).json(result);
    } catch (ex) {
        console.error('Service Transaktion: Error loading current balance. Exception occurred: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});




// schreibe eine transaktion vom benutzer 
/*serviceRouter.post('/transaktion', validateToken, (req, res) => {
    const bankkontoDao = new BankkontoDao(req.app.locals.dbConnection);

    const userId = req.userId; // Benutzer-ID aus dem Token
    const { bankkontoIdVon, bankkontoIdNach, kategorieId, wert, datum, notiz, typ } = req.body;

    const transaktionDao = new TransaktionDao(req.app.locals.dbConnection);

    try {
        const neueTransaktion = transaktionDao.create(userId, bankkontoIdVon, bankkontoIdNach, kategorieId, wert, datum, notiz, typ);
        const updateBankkonto = bankkontoDao.update(bankkontoIdVon,userId,)
        res.status(201).json(neueTransaktion); // Erfolgreich erstellt
    } catch (ex) {
        res.status(400).json({ fehler: true, nachricht: ex.message });
    }


});*/

// Neue Transaktion erstellen + Kontostände aktualisieren
serviceRouter.post('/transaktion', validateToken, (req, res) => {
    const transaktionDao = new TransaktionDao(req.app.locals.dbConnection);
    const bankkontoDao = new BankkontoDao(req.app.locals.dbConnection);
    
    const userId = req.userId; // Benutzer-ID aus dem Token
    const {
        bankkonto_id_von,  // z.B. "1" => ID des Quellkontos
        bankkonto_id_nach, // z.B. "2" => ID des Zielkontos (für Umbuchung)
        kategorie_id,
        wert,              // z.B. 100 oder -50
        transaktions_datum,
        notiz,
        typ                // 'ausgabe', 'einnahme' oder 'umbuchung'
    } = req.body;

    try {
        
        // Dann das Insert absetzen mit kategorieId
        
        // 1) Neue Transaktion in der DB anlegen
        const neueTransaktion = transaktionDao.create(
            userId,
            bankkonto_id_von, 
            bankkonto_id_nach,
            kategorie_id, 
            wert,
            transaktions_datum, 
            notiz, 
            typ
        );

        // 2) Kontostände anpassen (Ausgabe, Einnahme, Umbuchung)
        if (typ === 'ausgabe') {
            // Nur das "von"-Konto wird belastet (= Kontostand - wert)
            let kontoVon = bankkontoDao.loadById(bankkonto_id_von, userId);
            let aktuellerStand = parseFloat(kontoVon.kontostand);
            let neuerStand = aktuellerStand - parseFloat(wert);

            bankkontoDao.update(
                bankkonto_id_von,
                userId,
                kontoVon.kontoname,
                neuerStand,
                kontoVon.iban
            );

        } else if (typ === 'einnahme') {
            // Nur das "von"-Konto (in dem Fall dein Zielkonto) bekommt + wert
            // (Manchmal nennt man es bankkonto_id_von oder bankkonto_id_nach – je nach Logik)
            let kontoVon = bankkontoDao.loadById(bankkonto_id_von, userId);
            let aktuellerStand = parseFloat(kontoVon.kontostand);
            let neuerStand = aktuellerStand + parseFloat(wert);

            bankkontoDao.update(
                bankkonto_id_von,
                userId,
                kontoVon.kontoname,
                neuerStand,
                kontoVon.iban
            );

        } else if (typ === 'umbuchung') {
            console.log("umbuchung service if aufgerufen");
            // Umbuchung: Vom Quellkonto abziehen, dem Zielkonto gutschreiben
            let kontoVon = bankkontoDao.loadById(bankkonto_id_von, userId);
            let standVon = parseFloat(kontoVon.kontostand);
            let neuerStandVon = standVon - parseFloat(wert);

            bankkontoDao.update(
                bankkonto_id_von,
                userId,
                kontoVon.kontoname,
                neuerStandVon,
                kontoVon.iban
            );

            // Konto "nach" nur aktualisieren, wenn bankkonto_id_nach != null
            if (bankkonto_id_nach) {
                let kontoNach = bankkontoDao.loadById(bankkonto_id_nach, userId);
                let standNach = parseFloat(kontoNach.kontostand);
                let neuerStandNach = standNach + parseFloat(wert);

                bankkontoDao.update(
                    bankkonto_id_nach,
                    userId,
                    kontoNach.kontoname,
                    neuerStandNach,
                    kontoNach.iban
                );
            }
        }

        // 3) JSON-Antwort mit der neu erstellten Transaktion zurückgeben
        res.status(201).json(neueTransaktion);

    } catch (ex) {
        console.error('Fehler beim Erstellen der Transaktion:', ex.message);
        res.status(400).json({ fehler: true, nachricht: ex.message });
    }
});




// ändere eine transaktion vom benutzer
serviceRouter.put('/transaktion/:id', validateToken, function(request, response) {
    console.log('Service Transaktion: Client requests update of transaction with id=' + request.params.id);
    const transaktionDao = new TransaktionDao(request.app.locals.dbConnection);

    const { bankkontoIdVon, bankkontoIdNach, kategorieId, wert, datum, notiz, typ } = request.body;

    try {
        var result = transaktionDao.update(
            request.params.id,
            request.userId,
            bankkontoIdVon,
            bankkontoIdNach,
            kategorieId,
            wert,
            datum,
            notiz,
            typ
        );
        console.log('Service Transaktion: Transaction updated with id=' + result.id);
        response.status(200).json(result);
    } catch (ex) {
        console.error('Service Transaktion: Error updating transaction. Exception occurred: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});



// lösche eine transaktion vom benutzer
serviceRouter.delete('/transaktion/:id', validateToken, function(request, response) {
    console.log('Service Transaktion: Client requests deletion of transaction with id=' + request.params.id);
    const transaktionDao = new TransaktionDao(request.app.locals.dbConnection);

    try {
        transaktionDao.delete(request.params.id, request.userId);
        console.log('Service Transaktion: Transaction with id=' + request.params.id + ' successfully deleted.');
        response.status(200).json({ 'nachricht': 'Transaction successfully deleted.' });
    } catch (ex) {
        console.error('Service Transaktion: Error deleting transaction. Exception occurred: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// hole eine transaktion vom benutzer
serviceRouter.get('/transaktion/:id', validateToken, function(request, response) {
    console.log('Service Transaktion: Client requests a transaction with id=' + request.params.id);
    const transaktionDao = new TransaktionDao(request.app.locals.dbConnection);

    try {
        var result = transaktionDao.loadById(request.params.id, request.userId);
        console.log('Service Transaktion: Transaction loaded with id=' + result.id);
        response.status(200).json(result);
    } catch (ex) {
        console.error('Service Transaktion: Error loading transaction. Exception occurred: ' + ex.message);
        response.status(404).json({ 'fehler': true, 'nachricht': ex.message });
    }
});





module.exports = serviceRouter;