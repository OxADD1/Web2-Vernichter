const helper = require('../helper.js'); //Module rausholen für Überprüfungen

class KundenserviceDao {

    constructor(dbConnection) {
        this._conn = dbConnection; // Datenbankverbindung speichern
    }

    getConnection() { // Verbindung zurückgeben
        return this._conn;
    }

    create(typ, anrede, name, email, nachricht) {      
        // SQL-Befehl zum Einfügen eines neuen Eintrags in die Tabelle
        var sql = `
            INSERT INTO Kundenservice (typ, anrede, name, email, nachricht)
            VALUES (?, ?, ?, ?, ?)
        `;
        var statement = this._conn.prepare(sql);
        var params = [typ, anrede, name, email, nachricht];

        // Ausführen des SQL-Befehls
        var result = statement.run(params);

        // Überprüfen, ob der Eintrag erfolgreich erstellt wurde
        if (result.changes != 1) {
            throw new Error('Der Kundenservice-Eintrag konnte nicht erstellt werden.');
        }

        // Rückgabe der ID des neuen Eintrags
        return { 
            id: result.lastInsertRowid, // ID des neuen Eintrags
            typ: typ, // Typ des Feedbacks (z. B. Problem, Feedback)
            anrede: anrede, // Anrede (z. B. Herr, Frau)
            name: name, // Name des Absenders
            email: email, // E-Mail des Absenders
            nachricht: nachricht, // Inhalt der Nachricht
        };
    }

    toString() {
        console.log('KundenserviceDao [_conn=' + this._conn + ']');
    }
}

module.exports = KundenserviceDao;