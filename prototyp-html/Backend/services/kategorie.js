const helper = require('../helper.js');
const KategorieDao = require('../dao/kategorieDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Kategorie');

// Alle Kategorien abrufen
serviceRouter.get('/kategorie/alle', function(request, response) {
    console.log('Service Kategorie: Client requested all records');

    const kategorieDao = new KategorieDao(request.app.locals.dbConnection);
    try {
        var arr = kategorieDao.loadAll();
        console.log('Service Kategorie: Records loaded, count=' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service Kategorie: Error loading all records. Exception occurred: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Eine einzelne Kategorie abrufen
serviceRouter.get('/kategorie/:id', function(request, response) {
    console.log('Service Kategorie: Client requested record for id=' + request.params.id);

    const kategorieDao = new KategorieDao(request.app.locals.dbConnection);
    try {
        var obj = kategorieDao.loadById(request.params.id);
        console.log('Service Kategorie: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Kategorie: Error loading record. Exception occurred: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});


module.exports = serviceRouter;
