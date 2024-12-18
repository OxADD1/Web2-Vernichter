const helper = require('../helper.js');
const TransaktionDao = require('../dao/transaktionDao.js');
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


// hole gefilterte transaktion vom benutzer
serviceRouter.post('/transaktion/filtered', validateToken, function(request, response) {
    console.log('Service Transaktion: Client requests filtered transactions for userId=' + request.userId);
    const transaktionDao = new TransaktionDao(request.app.locals.dbConnection);

    const { startDatum, endDatum, kategorieId } = request.body;

    try {
        var result = transaktionDao.loadFiltered(request.userId, { startDatum, endDatum, kategorieId });
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
serviceRouter.post('/transaktion', validateToken, (req, res) => {
    const userId = req.userId; // Benutzer-ID aus dem Token
    const { bankkontoIdVon, bankkontoIdNach, kategorieId, wert, datum, notiz, typ } = req.body;

    const transaktionDao = new TransaktionDao(req.app.locals.dbConnection);

    try {
        const neueTransaktion = transaktionDao.create(userId, bankkontoIdVon, bankkontoIdNach, kategorieId, wert, datum, notiz, typ);
        res.status(201).json(neueTransaktion); // Erfolgreich erstellt
    } catch (ex) {
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







module.exports = serviceRouter;