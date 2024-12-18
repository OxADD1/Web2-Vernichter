const helper = require('../helper.js');
const TransaktionDao = require('../dao/transaktionDao.js');
const validateToken = require('../tokenHandling/validateToken.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Transaktion');

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










module.exports = serviceRouter;