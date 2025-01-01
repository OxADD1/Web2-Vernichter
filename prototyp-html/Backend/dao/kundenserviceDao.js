const helper = require('../helper.js'); //Module rausholen für Überprüfungen
const BenutzerDao = require('./benutzerDao.js');

class KundenserviceDao {

    constructor(dbConnection) {
        this._conn = dbConnection; // Datenbankverbindung speichern
    }

    getConnection() { // Verbindung zurückgeben
        return this._conn;
    }

    create(typ, anrede, name, email, nachricht, user_id) {
        const benutzerDao = new BenutzerDao(this._conn);

        const sql = `
            INSERT INTO Kundenservice (typ, anrede, name, email, nachricht, user_id)
            VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [typ, anrede, name, email, nachricht, user_id];
    
        const statement = this._conn.prepare(sql);
        const result = statement.run(params);
    
        if (result.changes !== 1) {
            throw new Error('Der Kundenservice-Eintrag konnte nicht erstellt werden.');
        }
    
        const benutzer = benutzerDao.loadById(user_id);

        return {
            id: result.lastInsertRowid,
            typ: typ,
            anrede: anrede,
            name: name,
            email: email,
            nachricht: nachricht,
            benutzer: benutzer
        };
        
    }
    

    toString() {
        console.log('KundenserviceDao [_conn=' + this._conn + ']');
    }
}

module.exports = KundenserviceDao;