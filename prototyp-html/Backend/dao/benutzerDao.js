const helper = require('../helper.js');

class BenutzerDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    // Lädt einen Benutzer anhand seiner ID (z.B. für Authentifizierung/Prüfungen)
    loadById(id) {
        const sql = 'SELECT * FROM Benutzer WHERE id = ?';
        const statement = this._conn.prepare(sql);
        const result = statement.get(id);

        if (helper.isUndefined(result))
            throw new Error('No Record found by id=' + id);

        return result;
    }


    /*loadAll() {
        var sql = 'SELECT * FROM Benutzer';
        var statement = this._conn.prepare(sql);
        var result = statement.all();

        if (helper.isArrayEmpty(result)) 
            return [];

        for (var i = 0; i < result.length; i++) {

            result[i].benutzerrolle = benutzerrolleDao.loadById(result[i].benutzerrolleId);
            delete result[i].benutzerrolleid;

            if (helper.isNull(result[i].personId)) {
                result[i].person = null;
            } else {
                result[i].person = personDao.loadById(result[i].personId);
            }
            delete result[i].personId;
        }

        return result;
    }*/



    // Prüft, ob ein Benutzer mit der gegebenen ID existiert
    exists(id) {
        const sql = 'SELECT COUNT(id) AS cnt FROM Benutzer WHERE id = ?';
        const statement = this._conn.prepare(sql);
        const result = statement.get(id);

        return result.cnt === 1;
    }



    // Prüft, ob ein Benutzername eindeutig ist (für Registrierung)
    isunique(benutzername) {
        const sql = 'SELECT COUNT(id) AS cnt FROM Benutzer WHERE benutzername = ?';
        const statement = this._conn.prepare(sql);
        const result = statement.get(benutzername);

        return result.cnt === 0; // true, wenn Benutzername einzigartig ist
    }



    // prüft, ob ein Benutzer mit dem angegebenen Benutzernamen und Passwort in der
    // Datenbank existiert. Wenn der Benutzer existiert, wird dessen vollständiges
    //Benutzerobjekt zurückgegeben; ansonsten wird ein Fehler geworfen
    // Prüft, ob Benutzer Zugriff hat (Login)
    hasaccess(benutzername, passwort) {
        const sql = 'SELECT id FROM Benutzer WHERE benutzername = ? AND passwort = ?';
        const statement = this._conn.prepare(sql);
        const params = [benutzername, passwort];
        const result = statement.get(params);

        if (helper.isUndefined(result))
            throw new Error('Invalid credentials. Access denied.');

        return result.id; // Gibt die Benutzer-ID zurück, falls Zugang besteht
    }

    create(benutzername = '', passwort = '') {
        // Prüfen, ob der Benutzername eindeutig ist
        if (!this.isunique(benutzername)) {
            throw new Error('Benutzername ist bereits vergeben: ' + benutzername);
        }
    
        // Benutzer erstellen
        const sqlInsert = 'INSERT INTO Benutzer (benutzername, passwort) VALUES (?, ?)';
        const statementInsert = this._conn.prepare(sqlInsert);
        const params = [benutzername, passwort];
        const result = statementInsert.run(params);
    
        if (result.changes !== 1) {
            throw new Error('Benutzer konnte nicht erstellt werden. Daten: ' + params);
        }
    
        // Rückgabe des neu erstellten Benutzers
        return this.loadById(result.lastInsertRowid);
    }
    


    /*update(id, benutzername = '', neuespasswort = null) {
        
        if (helper.isNull(neuespasswort)) {
            var sql = 'UPDATE Benutzer SET benutzername=?,benutzerrolleId=?,personId=? WHERE id=?';
            var statement = this._conn.prepare(sql);
            var params = [benutzername, benutzerrolleId, personId, id];
        } else {
            var sql = 'UPDATE Benutzer SET benutzername=?,passwort=?,benutzerrolleId=?,personId=? WHERE id=?';
            var statement = this._conn.prepare(sql);
            var params = [benutzername, neuespasswort, benutzerrolleId, personId, id];
        }
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not update existing Record. Data: ' + params);

        return this.loadById(id);
    }*/

    /*delete(id) {
        try {
            var sql = 'DELETE FROM Benutzer WHERE id=?';
            var statement = this._conn.prepare(sql);
            var result = statement.run(id);

            if (result.changes != 1) 
                throw new Error('Could not delete Record by id=' + id);

            return true;
        } catch (ex) {
            throw new Error('Could not delete Record by id=' + id + '. Reason: ' + ex.message);
        }
    }*/

    toString() {
        console.log('BenutzerDao [_conn=' + this._conn + ']');
    }
}

module.exports = BenutzerDao;