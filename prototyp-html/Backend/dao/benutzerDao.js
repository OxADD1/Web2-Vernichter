const helper = require('../helper.js');

class BenutzerDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    // Kann man vllt löschen oder wichtig für Token und Login?
    loadById(id) {
        //Benutzerobjekt noch email und passwort hinzufügen?
        var sql = 'SELECT * FROM Benutzer WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

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



    exists(id) { // checkt nach, ob die ID exisitert
        var sql = 'SELECT COUNT(id) AS cnt FROM Benutzer WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    isunique(benutzername) {  // Überprüft, ob ein benutzername in der Tabelle 
        //Benutzer eindeutig ist (d. h., ob er noch nicht verwendet wurde).
        var sql = 'SELECT COUNT(id) AS cnt FROM Benutzer WHERE benutzername=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(benutzername);

        if (result.cnt == 0) 
            return true;

        return false;
    }

    hasaccess(benutzername, passwort) {
        // prüft, ob ein Benutzer mit dem angegebenen Benutzernamen und Passwort in der
        // Datenbank existiert. Wenn der Benutzer existiert, wird dessen vollständiges
        //Benutzerobjekt zurückgegeben; ansonsten wird ein Fehler geworfen
        var sql = 'SELECT id FROM Benutzer WHERE benutzername=? AND passwort=?';
        var statement = this._conn.prepare(sql);
        var params = [benutzername, passwort];
        var result = statement.get(params);

        if (helper.isUndefined(result)) 
            throw new Error('User has no access');
     
        return result.id;
    }

    create(benutzername = '', passwort = '') {
        //kreiert benutzerobjekt und erstellt id aus letzter reihe
        var sql = 'INSERT INTO Benutzer (benutzername,passwort) VALUES (?,?)';
        var statement = this._conn.prepare(sql);
        var params = [benutzername, passwort];
        var result = statement.run(params);

        if (result.changes != 1) 
            throw new Error('Could not insert new Record. Data: ' + params);

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