const helper = require('../helper.js');
const KundenserviceDao = require('../dao/kundenserviceDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Kundenservice');

serviceRouter.post('/kundenservice', function(request, response) {
    console.log('Service Kundenservice: Client requested creation of new record');

    var errorMsgs = [];
    if (helper.isUndefined(request.body.typ)) 
        errorMsgs.push('typ fehlt');
    if (helper.isUndefined(request.body.anrede)) 
        errorMsgs.push('anrede fehlt');
    if (helper.isUndefined(request.body.name)) 
        errorMsgs.push('name fehlt');
    if (helper.isUndefined(request.body.email)) 
        errorMsgs.push('email fehlt');
    if (helper.isUndefined(request.body.nachricht)) 
        errorMsgs.push('nachricht fehlt');
    
    if (errorMsgs.length > 0) {
        console.log('Service Kundenservice: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const kundenserviceDao = new KundenserviceDao(request.app.locals.dbConnection);
    try {
        var obj = kundenserviceDao.create(request.body.typ, request.body.anrede, request.body.name, request.body.email,request.body.nachricht);
        console.log('Service Kundenservice: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Kundenservice: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

module.exports = serviceRouter;