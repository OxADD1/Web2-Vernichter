const helper = require('../helper.js');
const BenutzerDao = require('./benutzerDao.js');

class BankkontoDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    loadById(id) { // ein bankonto laden, wichtig für transaktionen
        const benutzerDao = new BenutzerDao(this._conn);

        var sql = 'SELECT * FROM Bankkonto WHERE id=?'; // man muss hier tabelle eingeben
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        result.benutzer = benutzerDao.loadById(result.benutzer_id); // objekt in objekt
        delete result.benutzer_id;
        

        return result;
    }

    loadAllByUserId(userId) { // alle Konten für Kontoverwaltung und UserId aus Token
        const benutzerDao = new BenutzerDao(this._conn);

        var sql = 'SELECT * FROM Benutzer';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].benutzer = benutzerDao.loadById(result[i].benutzer_id);
            delete result[i].benutzer_id;
        }

        return result;
    }

    exists(id) { // zum prüfen, ob ein datensatz bereits existiert, bevor man ihn anlegt
        var sql = 'SELECT COUNT(id) AS cnt FROM Bankkonto WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(benutzerId, kontoname='', kontostand = 0.0, iban = '') {
        const sql = `INSERT INTO Bankkonto (benutzer_id, kontoname, kontostand, iban) VALUES (?, ?, ?, ?)`;
        const statement = this._conn.prepare(sql); // Bereite das SQL-Statement vor
        const params = [benutzerId, kontoname, kontostand, iban]; // Parameter-Werte
        
        // Führe das Statement mit den Werten aus
        const result = statement.run(params);
    
        // Überprüfen, ob genau eine Zeile eingefügt wurde
        if (result.changes !== 1) {
            throw new Error('Could not insert new bank account. Data: ' + params);
        }
    
        // Lade und gib das neu erstellte Bankkonto zurück
        return this.loadById(result.lastInsertRowid);
    }
    

    update(id, benutzerId, kontoname='', kontostand = 0.0, iban = '')  {
        var sql = 'UPDATE Bankkonto SET benutzer_id=?,kontoname=?,kontostand=?,iban=? WHERE id=?';
        var statement = this._conn.prepare(sql);
        var params = [benutzerId, kontoname, kontostand, iban, id];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);

        return this.loadById(id);
    }

    delete(id) {
        try {
            var sql = 'DELETE FROM Bankkonto WHERE id=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1) 
                throw new Error('Could not delete Record by id=' + id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Record by id=' + id + '. Reason: ' + ex.message);
        }
    }

    toString() {
        console.log('BankkontoDao [_conn=' + this._conn + ']');
    }
}

module.exports = BankkontoDao;