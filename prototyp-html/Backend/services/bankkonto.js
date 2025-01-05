const helper = require('../helper.js');
const BankkontoDao = require('../dao/bankkontoDao.js');
const validateToken = require('../tokenHandling/validateToken.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Bankkonto');

// Ein Bankkonto laden (nur für eingeloggten Benutzer)
serviceRouter.get('/bankkonto/gib/:id', validateToken, function(request, response) {
    console.log('Service Bankkonto: Client requested one record, id=' + request.params.id + ' for userId=' + request.userId);

    const bankkontoDao = new BankkontoDao(request.app.locals.dbConnection);
    try {
        var obj = bankkontoDao.loadById(request.params.id, request.userId);
        console.log('Service Bankkonto: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Bankkonto: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/bankkonto/gesamtvermoegen', validateToken, function(req, res) {
    const bankkontoDao = new BankkontoDao(req.app.locals.dbConnection);
    try {
        const summe = bankkontoDao.getGesamtvermoegenByUserId(req.userId);
        res.status(200).json({ gesamtvermoegen: summe });
    } catch (ex) {
        res.status(400).json({ fehler: true, nachricht: ex.message });
    }
});


// Alle Bankkonten des eingeloggten Benutzers laden
serviceRouter.get('/bankkonto/alle', validateToken, function(request, response) {
    console.log('Service Bankkonto: Client requested all records for userId=' + request.userId);

    const bankkontoDao = new BankkontoDao(request.app.locals.dbConnection);
    try {
        var arr = bankkontoDao.loadAllByUserId(request.userId);
        console.log('Service Bankkonto: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Bankkonto: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});



// Ein neues Bankkonto erstellen
serviceRouter.post('/bankkonto', validateToken, function(request, response) {
    console.log('Service Bankkonto: Client requested creation of new record for userId=' + request.userId);

    const { kontoname, kontostand, iban } = request.body;
    var errorMsgs = [];

    if (helper.isUndefined(kontoname)) errorMsgs.push('kontoname fehlt');
    if (helper.isUndefined(kontostand)) errorMsgs.push('kontostand fehlt');
    if (helper.isUndefined(iban)) errorMsgs.push('iban fehlt');

    if (errorMsgs.length > 0) {
        response.status(400).json({ 'fehler': true, 'nachricht': 'Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const bankkontoDao = new BankkontoDao(request.app.locals.dbConnection);
    try {
        var obj = bankkontoDao.create(request.userId, kontoname, kontostand, iban);
        console.log('Service Bankkonto: Record created');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Bankkonto: Error creating record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});



// Ein Bankkonto aktualisieren
serviceRouter.put('/bankkonto', validateToken, function(request, response) {
    console.log('Service Bankkonto: Client requested update for record for userId=' + request.userId);

    const { id, kontoname, kontostand, iban } = request.body;
    var errorMsgs = [];

    if (helper.isUndefined(id)) errorMsgs.push('id fehlt');
    if (helper.isUndefined(kontoname)) errorMsgs.push('kontoname fehlt');
    if (helper.isUndefined(kontostand)) errorMsgs.push('kontostand fehlt');
    if (helper.isUndefined(iban)) errorMsgs.push('iban fehlt');

    if (errorMsgs.length > 0) {
        response.status(400).json({ 'fehler': true, 'nachricht': 'Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const bankkontoDao = new BankkontoDao(request.app.locals.dbConnection);
    try {
        var obj = bankkontoDao.update(id, request.userId, kontoname, kontostand, iban);
        console.log('Service Bankkonto: Record updated, id=' + id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Bankkonto: Error updating record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});



// Ein Bankkonto löschen
serviceRouter.delete('/bankkonto/:id', validateToken, function(request, response) {
    console.log('Service Bankkonto: Client requested deletion of record, id=' + request.params.id + ' for userId=' + request.userId);

    const bankkontoDao = new BankkontoDao(request.app.locals.dbConnection);
    try {
        var obj = bankkontoDao.loadById(request.params.id, request.userId);
        bankkontoDao.delete(request.params.id, request.userId);
        console.log('Service Bankkonto: Record deleted, id=' + request.params.id);
        response.status(200).json({ 'gelöscht': true, 'eintrag': obj });
    } catch (ex) {
        console.error('Service Bankkonto: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;