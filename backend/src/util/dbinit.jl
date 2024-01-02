using FunnyORM, SQLite
db = FunnyORM.DB{SQLite.DB}(dbpath)
DBInterface.execute(
    db.connection,
    """
CREATE TABLE IF NOT EXISTS Users (
userId INTEGER PRIMARY KEY NOT NULL, 
username TEXT NOT NULL UNIQUE,
email TEXT
);
"""
)
DBInterface.execute(
    db.connection,
    """
CREATE TABLE IF NOT EXISTS Snippets (
id INTEGER PRIMARY KEY NOT NULL,
created_at TEXT NOT NULL,
snippet_text TEXT NOT NULL,
origin_website TEXT,
predicted_topic TEXT
);
"""
)

DBInterface.execute(
    db.connection,
    """
CREATE TABLE IF NOT EXISTS CardContents (
cardContentId INTEGER PRIMARY KEY NOT NULL,
front TEXT NOT NULL,
back TEXT NOT NULL,
snippet_id INTEGER NOT NULL,
FOREIGN KEY (snippet_id)
    REFERENCES Snippets (id)
);
"""
)
DBInterface.execute(
    db.connection,
    """
    CREATE TABLE IF NOT EXISTS Cards (
    cardId INTEGER PRIMARY KEY NOT NULL, 
    cardContentId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    due TEXT, 
    stability REAL,
    difficulty REAL,
    elapsed_days INTEGER,
    scheduled_days INTEGER,
    reps INTEGER,
    lapses INTEGER,
    state INTEGER,
    last_review TEXT,
    isactive INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (userId)
        REFERENCES Users (userId)
    FOREIGN KEY (cardContentId)
        REFERENCES CardContents (cardContentId)

    );
    """
)
db = FunnyORM.DB{SQLite.DB}(dbpath)

FunnyORM.generate_file(db, :User)
FunnyORM.generate_file(db, :CardContent)
FunnyORM.generate_file(db, :Card)
FunnyORM.generate_file(db, :Snippet)

# init with sentences
