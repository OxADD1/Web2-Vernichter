const helper = require('../helper.js'); //Module rausholen für Überprüfungen
const KategorieDao = require('./kategorieDao.js');
const BenutzerDao = require('./benutzerDao.js');

/*In der Bankkonto-Logik benötigst du die userId, um sicherzustellen, dass jeder Benutzer nur seine eigenen Daten sehen, ändern oder löschen kann.
Nutze validateToken für alle geschützten Routen, die benutzerspezifische Daten verarbeiten.
Bei Routen, die globale Daten bereitstellen (z.B. Kategorien), ist die userId nicht nötig.*/ 


class TransaktionDao {

    constructor(dbConnection) {
        this._conn = dbConnection; // Datenbankverbindung speichern
    }

    getConnection() { // Verbindung zurückgeben
        return this._conn;
    }

    loadById(id, userId) { // ein bankonto laden, wichtig für transaktionen
        const kategorieDao = new KategorieDao(this._conn);
        const benutzerDao = new BenutzerDao(this._conn);
    
        var sql = 'SELECT * FROM Transaktion WHERE id = ? AND benutzer_id = ?'; // man muss hier tabelle eingeben
        var statement = this._conn.prepare(sql);
        var result = statement.get(id, userId);

        if (helper.isUndefined(result)) 
            throw new Error('No Record found by id=' + id);

        result.benutzer = benutzerDao.loadById(result.benutzer_id);        
        delete result.benutzer_id;
    
        result.kategorie = kategorieDao.loadById(result.kategorie_id);
        delete result.kategorie_id;

        return result;
    }


    loadAllByUserId(userId) {
        const kategorieDao = new KategorieDao(this._conn);
        const benutzerDao = new BenutzerDao(this._conn);

        var sql = 'SELECT * FROM Transaktion WHERE benutzer_id=?';
        var statement = this._conn.prepare(sql);
        var params = [userId]; // Array mit userId
        var arr = statement.all(params); // führt sql abfrage aus und ersetzt die ? im SQl befehl durch die werte aus den klammern

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
    

    loadFiltered(userId, startDatum = null, endDatum = null, kategorie = 'Alle') {
        const kategorieDao = new KategorieDao(this._conn);
        const benutzerDao = new BenutzerDao(this._conn);
    
        // SQL-Query mit Filtern für Datum und Kategorie
        const sql = `
            SELECT * 
            FROM transaktion
            WHERE benutzer_id = ?
            AND (transaktions_datum BETWEEN ? AND ? OR (? IS NULL AND ? IS NULL))
            AND (? = 'Alle' OR kategorie_id = ?)
        `;
    
        // Parameter in richtiger Reihenfolge
        const params = [
            userId,       // Benutzer-Filter
            startDatum,   // Startdatum
            endDatum,     // Enddatum
            startDatum,   // NULL-Prüfung Startdatum
            endDatum,     // NULL-Prüfung Enddatum
            kategorie,    // "Alle" oder spezifische Kategorie
            kategorie     // Filter für kategorie_id
        ];
        
    
        // Statement vorbereiten und ausführen
        const statement = this._conn.prepare(sql);
        const arr = statement.all(params);
    
        // Überprüfen, ob Ergebnisse vorhanden sind
        if (helper.isArrayEmpty(arr)) {
            return [];
        }
    
        // Kategorie- und Benutzer-Daten laden und zuweisen
        for (let i = 0; i < arr.length; i++) {
            // Kategorie-Objekt hinzufügen und ID entfernen
            arr[i].kategorie = kategorieDao.loadById(arr[i].kategorie_id);
            delete arr[i].kategorie_id;
    
            // Benutzer-Objekt hinzufügen und ID entfernen
            arr[i].benutzer = benutzerDao.loadById(arr[i].benutzer_id);
            delete arr[i].benutzer_id;
        }
    
        return arr;
    }
    
    getCurrentBalance(userId) {
        const sql = `
            SELECT 
                SUM(CASE WHEN wert > 0 THEN wert ELSE 0 END) AS einnahmen,
                SUM(CASE WHEN wert < 0 THEN wert ELSE 0 END) AS ausgaben,
                SUM(wert) AS kontostand
            FROM transaktion
            WHERE benutzer_id = ?
        `;
    
        const statement = this._conn.prepare(sql);
        const result = statement.get([userId]);
    
        return result; // { einnahmen: 1000, ausgaben: -500, kontostand: 500 }
    }
    

    getExpensesByCategory(userId) {
        const sql = `
            SELECT kategorie.name AS kategorie, SUM(t.wert) AS betrag
            FROM transaktion t
            JOIN kategorie ON t.kategorie_id = kategorie.id
            WHERE t.benutzer_id = ? AND t.wert < 0
            GROUP BY kategorie.name
        `;
    
        const statement = this._conn.prepare(sql);
        const result = statement.all([userId]);
    
        return result; // [{ kategorie: 'Miete', betrag: -200 }, { kategorie: 'Freizeit', betrag: -100 }]
    }
    



    exists(id) { // zum prüfen, ob ein datensatz bereits existiert, bevor man ihn anlegt
        var sql = 'SELECT COUNT(id) AS cnt FROM Transaktion WHERE id=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(id);

        if (result.cnt == 1) 
            return true;

        return false;
    }

    create(userId, bankkontoIdVon, bankkontoIdNach, kategorieId, wert = 0.00, datum, notiz, typ) {
        const sql = `INSERT INTO Transaktion (benutzer_id, bankkonto_id_von, bankkonto_id_nach, kategorie_id, wert, transaktions_datum, notiz, typ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const statement = this._conn.prepare(sql); // Bereite das SQL-Statement vor
        const params = [userId, bankkontoIdVon, bankkontoIdNach, kategorieId, wert, datum, notiz, typ]; // Parameter-Werte
        
        // Führe das Statement mit den Werten aus
        const result = statement.run(params);
        //statement.all wenn mehrere Datemsätze geladen werden sollen
        //statement.run, um Daten in DB zu schreiben oder zu verändern
    
        // Überprüfen, ob genau eine Zeile eingefügt wurde
        if (result.changes !== 1) {
            throw new Error('Could not insert new transaction. Data: ' + params);
        }
    
        // Lade und gib das neu erstellte Bankkonto zurück
        return this.loadById(result.lastInsertRowid, userId);
    }
    

    update(id, userId, bankkontoIdVon, bankkontoIdNach, kategorieId, wert = 0.00, datum, notiz, typ) {
        
        // Prüfen, ob die Transaktion existiert
        if (!this.exists(id, userId)) {
            throw new Error(`Transaction with id=${id} for userId=${userId} does not exist.`);
        }
        
        const sql = `
            UPDATE Transaktion 
            SET bankkonto_id_von = ?, bankkonto_id_nach = ?, 
                kategorie_id = ?, wert = ?, transaktions_datum = ?, 
                notiz = ?, typ = ?
            WHERE id = ? AND benutzer_id = ?`;
    
        const statement = this._conn.prepare(sql);
    
        // Parameter: Werte für das Update und die Überprüfung auf id und userId
        const params = [bankkontoIdVon, bankkontoIdNach, kategorieId, wert, datum, notiz, typ, id, userId];
    
        const result = statement.run(params);
    
        // Prüfen, ob genau ein Datensatz aktualisiert wurde
        if (result.changes !== 1) {
            throw new Error('Could not update existing record in Transaktion. Either it does not exist or does not belong to userId=' + userId);
        }
    
        // Rückgabe der aktualisierten Transaktion
        return this.loadById(id, userId);
    }
    

    delete(id, userId) {
        // Prüfen, ob die Transaktion existiert
        if (!this.exists(id, userId)) {
            throw new Error(`Transaction with id=${id} for userId=${userId} does not exist.`);
        }
        
        
        try {
            const sql = 'DELETE FROM Transaktion WHERE id = ? AND benutzer_id = ?';
            const statement = this._conn.prepare(sql);
    
            // Führe die Abfrage aus und übergebe id und userId
            const result = statement.run(id, userId);
    
            // Überprüfe, ob genau ein Datensatz gelöscht wurde
            if (result.changes !== 1) {
                throw new Error(`Could not delete record with id=${id} for userId=${userId}. Either it does not exist or does not belong to the user.`);
            }
    
            return true; // Erfolgreich gelöscht
        } catch (error) {
            throw new Error(`Could not delete record with id=${id} for userId=${userId}. Reason: ${error.message}`);
        }
    }
    
    

    toString() {
        console.log('TransaktionDao [_conn=' + this._conn + ']');
    }
}

module.exports = TransaktionDao;