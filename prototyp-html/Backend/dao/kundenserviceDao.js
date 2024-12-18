const helper = require('../helper.js'); //Module rausholen für Überprüfungen

class KundenserviceDao {

    constructor(dbConnection) {
        this._conn = dbConnection; // Datenbankverbindung speichern
    }

    getConnection() { // Verbindung zurückgeben
        return this._conn;
    }

    create(typ, anrede, name, email, nachricht, userId) {
        const sql = `
            INSERT INTO Kundenservice (typ, anrede, name, email, nachricht, benutzer_id)
            VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [typ, anrede, name, email, nachricht, userId];
    
        const statement = this._conn.prepare(sql);
        const result = statement.run(params);
    
        if (result.changes !== 1) {
            throw new Error('Der Kundenservice-Eintrag konnte nicht erstellt werden.');
        }
    
        return {
            id: result.lastInsertRowid,
            typ: typ,
            anrede: anrede,
            name: name,
            email: email,
            nachricht: nachricht,
            benutzer_id: userId
        };
    }
    

    toString() {
        console.log('KundenserviceDao [_conn=' + this._conn + ']');
    }
}

module.exports = KundenserviceDao;