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
CREATE TABLE IF NOT EXISTS CardContents (
cardContentId INTEGER PRIMARY KEY NOT NULL,
front TEXT NOT NULL,
back TEXT NOT NULL
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
    FOREIGN KEY (userId)
        REFERENCES Users (userId)
    FOREIGN KEY (cardContentId)
        REFERENCES CardContents (cardContentId)

    );
    """
)
db = FunnyORM.DB{SQLite.DB}(dbpath)

FunnyORM.generate_file(db, :User)
FunnyORM.generate_file(db, :CardContents)
FunnyORM.generate_file(db, :Cards)

# init with sentences
