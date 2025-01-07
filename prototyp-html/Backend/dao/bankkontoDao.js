const helper = require('../helper.js');
const BenutzerDao = require('./benutzerDao.js');

class BankkontoDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    // Ein Bankkonto laden, gehört zur userId
    loadById(id, userId) {
        const benutzerDao = new BenutzerDao(this._conn);

        var sql = 'SELECT * FROM Bankkonto WHERE id=? AND benutzer_id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id, userId);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id + ' for userId=' + userId);

        result.benutzer = benutzerDao.loadById(result.benutzer_id);
        delete result.benutzer_id;

        return result;
    }

    getGesamtvermoegenByUserId(userId) {
        const sql = `
            SELECT SUM(kontostand) AS gesamt
            FROM Bankkonto
            WHERE benutzer_id = ?
        `;
        const statement = this._conn.prepare(sql);
        const row = statement.get(userId);
    
        return row.gesamt || 0; // falls NULL, auf 0 fallbacken
    }
    

    loadAllByUserId(userId) { // alle Konten für Kontoverwaltung und UserId aus Token
        const benutzerDao = new BenutzerDao(this._conn);

        var sql = 'SELECT * FROM Bankkonto WHERE benutzer_id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.all(userId);


        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {
            result[i].benutzer = benutzerDao.loadById(result[i].benutzer_id);
            delete result[i].benutzer_id;
        }

        return result;
    }

    // Prüfen, ob ein Bankkonto existiert und zur userId gehört
    exists(id, userId) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Bankkonto WHERE id=? AND benutzer_id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id, userId);

        return result.cnt > 0;
    }

    
    create(userId, kontoname = '', kontostand = 0.0, iban = '') {
        // Überprüfen, ob der Kontoname eindeutig ist, durch Aufruf von isunique
        if (!this.isunique(kontoname, userId)) {
            throw new Error(`Kontoname '${kontoname}' existiert bereits für diesen Benutzer.`);
        }
    
        // Wenn der Name eindeutig ist, neues Konto erstellen
        const sqlInsert = `INSERT INTO Bankkonto (benutzer_id, kontoname, kontostand, iban) VALUES (?, ?, ?, ?)`;
        const insertStatement = this._conn.prepare(sqlInsert);
        const params = [userId, kontoname, kontostand, iban];
    
        const result = insertStatement.run(params);
        console.log('result:', result);  // Für besseres Debugging
    
        if (result.changes !== 1) {
            throw new Error('Could not insert new bank account. Data: ' + params);
        }
    
        // Rückgabe des erstellten Kontos
        return this.loadById(result.lastInsertRowid, userId);
    }
    


    // Prüfen, ob der Kontoname einzigartig ist für die userId
    isunique(kontoname, userId) {
        var sql = 'SELECT COUNT(id) AS cnt FROM Bankkonto WHERE kontoname=? AND benutzer_id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(kontoname, userId);

        return result.cnt === 0;
    }

    // Ein Bankkonto aktualisieren
    update(id, userId, kontoname = '', kontostand = 0.0, iban = '') {
        if (!this.exists(id, userId)) {
            throw new Error(`Bank account with id=${id} does not exist for userId=${userId}`);
        }

        if (!this.isunique(kontoname, userId)) {
            throw new Error(`Kontoname '${kontoname}' existiert bereits für diesen Benutzer.`);
        }
        
        var sql = `
            UPDATE Bankkonto 
            SET kontoname=?, kontostand=?, iban=? 
            WHERE id=? AND benutzer_id=?`;
        var statement = this._conn.prepare(sql);
        var params = [kontoname, kontostand, iban, id, userId];

        const result = statement.run(params);

        if (result.changes !== 1) {
            throw new Error('Could not update existing record. Data: ' + params);
        }

        return this.loadById(id, userId);
    }


    

    // Ein Bankkonto löschen
    delete(id, userId) {
        if (!this.exists(id, userId)) {
            throw new Error(`Bank account with id=${id} does not exist for userId=${userId}`);
        }

        try {
            var sql = 'DELETE FROM Bankkonto WHERE id=? AND benutzer_id=?';
            var statement = this._conn.prepare(sql);
            const result = statement.run(id, userId);

            if (result.changes !== 1) {
                throw new Error(`Could not delete record with id=${id} for userId=${userId}.`);
            }

            return true;
        } catch (ex) {
            throw new Error(`Could not delete record with id=${id} for userId=${userId}. Reason: ${ex.message}`);
        }
    }
}

module.exports = BankkontoDao;