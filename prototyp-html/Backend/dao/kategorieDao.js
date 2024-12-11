const helper = require('../helper.js'); //Module rausholen für Überprüfungen

class KategorieDao {

    constructor(dbConnection) {
        this._conn = dbConnection; // Datenbankverbindung speichern
    }

    getConnection() { // Verbindung zurückgeben
        return this._conn;
    }

    loadById(id) {
        var sql = 'SELECT * FROM Kategorie WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        return result;
    }

    toString() {
        console.log('KategorieDao [_conn=' + this._conn + ']');
    }
}

module.exports = KategorieDao;