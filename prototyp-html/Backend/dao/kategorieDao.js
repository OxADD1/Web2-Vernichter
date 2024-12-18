const helper = require('../helper.js');

class KategorieDao {
    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }

    // Einzelne Kategorie nach ID laden
    loadById(id) {
        const sql = 'SELECT * FROM Kategorie WHERE id = ?';
        const statement = this._conn.prepare(sql);
        const result = statement.get(id);

        if (helper.isUndefined(result)) {
            throw new Error(`No record found for id=${id} in Kategorie.`);
        }

        return result;
    }

    // Alle Kategorien laden
    loadAll() {
        const sql = 'SELECT * FROM Kategorie';
        const statement = this._conn.prepare(sql);
        const result = statement.all();

        if (helper.isArrayEmpty(result)) {
            return [];
        }

        return result;
    }

    toString() {
        console.log('KategorieDao [_conn=' + this._conn + ']');
    }
}

module.exports = KategorieDao;
