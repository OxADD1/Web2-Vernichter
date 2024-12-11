const helper = require('../helper.js'); //Module rausholen für Überprüfungen
const KategorieDao = require('./kategorieDao.js');
const BenutzerDao = require('./benutzerDao.js');

class TransaktionDao {

    constructor(dbConnection) {
        this._conn = dbConnection; // Datenbankverbindung speichern
    }

    getConnection() { // Verbindung zurückgeben
        return this._conn;
    }

    loadAllByUserId(userId) {
        const kategorieDao = new KategorieDao(this._conn);
        const benutzerDao = new BenutzerDao(this._conn);

        var sql = 'SELECT * FROM Transaktion WHERE benutzer_id=?';
        var statement = this._conn.prepare(sql);
        var params = [userId];
        var arr = statement.all(params);

        if (helper.isArrayEmpty(arr)) 
            return [];

        for (var i=0; i<arr.length; i++) {
            arr[i].kategorie = kategorieDao.loadById(arr[i].kategorie_id);
            delete arr[i].kategorie_id;

            arr[i].benutzer = benutzerDao.loadById(arr[i].benutzer_id);
            delete arr[i].benutzer_id;
        }


        return arr;
    }
    

    toString() {
        console.log('TransaktionDao [_conn=' + this._conn + ']');
    }
}

module.exports = TransaktionDao;