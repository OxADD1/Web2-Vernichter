CREATE TABLE Benutzer (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    benutzername TEXT UNIQUE NOT NULL, 
    passwort TEXT NOT NULL
);

CREATE TABLE Bankkonto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    benutzer_id INTEGER NOT NULL,
    kontoname TEXT NOT NULL,
    kontostand DECIMAL(15,2) NOT NULL,
    iban TEXT NOT NULL,
    FOREIGN KEY (benutzer_id) REFERENCES benutzer(id) ON DELETE CASCADE
);


CREATE TABLE Kategorie (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

INSERT INTO Kategorie (name) VALUES 
('Transport'), 
('Bildung'), 
('Miete'), 
('Lebensmittel'), 
('Freizeit'), 
('Sonstiges');

CREATE TABLE Kundenservice (
    id INTEGER PRIMARY KEY,
    typ TEXT NOT NULL,
    anrede TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    nachricht TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES Benutzer(id) ON DELETE CASCADE
);

CREATE TABLE Transaktion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    benutzer_id INTEGER NOT NULL,
    bankkonto_id_von INTEGER NOT NULL,
    bankkonto_id_nach INTEGER DEFAULT NULL,
    kategorie_id INTEGER DEFAULT 5,        
    wert REAL NOT NULL,
    transaktions_datum TEXT NOT NULL,
    notiz TEXT NOT NULL,
    typ TEXT NOT NULL,
    FOREIGN KEY (benutzer_id) REFERENCES Benutzer(id) ON DELETE CASCADE,
    FOREIGN KEY (bankkonto_id_von) REFERENCES Bankkonto(id) ON DELETE CASCADE,
    FOREIGN KEY (bankkonto_id_nach) REFERENCES Bankkonto(id) ON DELETE CASCADE,
    FOREIGN KEY (kategorie_id) REFERENCES Kategorie(id) ON DELETE CASCADE
);

