import { db } from './database';

// Helper: wrap transaction in a Promise
const executeSql = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export async function createTables() {
  console.log('called');

  await executeSql(`
    CREATE TABLE IF NOT EXISTS UserEntity (
      id TEXT,
      name TEXT,
      age INTEGER,
      height INTEGER,
      weight INTEGER,
      gender TEXT,
      userId TEXT,
      email TEXT,
      password TEXT,
      code TEXT,
      dob TEXT,
      avatar TEXT
    );
  `);

  await executeSql(`
    CREATE TABLE IF NOT EXISTS DeviceBindEntity (
      id TEXT PRIMARY KEY,
      deviceId TEXT
    );
  `);

  await executeSql(`
    CREATE TABLE IF NOT EXISTS StepItemEntity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      steps INTEGER,
      date TEXT
    );
  `);

  await executeSql(`
    CREATE TABLE IF NOT EXISTS HealthVitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      bpm INTEGER,
      spO2 INTEGER,
      systolic INTEGER,
      diastolic INTEGER,
      stressIndex INTEGER,
      body REAL,
      wrist REAL,
      recordedAt INTEGER,
      recordedDate TEXT,
      UNIQUE(recordedDate)
    );
  `);

  await executeSql(`
    CREATE TABLE IF NOT EXISTS ActivitySummary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      steps INTEGER,
      distanceKm REAL,
      caloriesKcal INTEGER,
      avgBPM INTEGER,
      deepSleepMinutes INTEGER,
      lightSleepMinutes INTEGER,
      recordedDate TEXT,
      recordedAt INTEGER,
      UNIQUE(recordedDate)
    );
  `);

  await executeSql(`
    CREATE TABLE IF NOT EXISTS HourlyActivity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      steps INTEGER DEFAULT 0,
      calories INTEGER DEFAULT 0,
      hour INTEGER NOT NULL,
      recordedDate TEXT NOT NULL,
      recordedAt INTEGER,
      UNIQUE(userId, recordedDate, hour)
    );
  `);

  await executeSql(`
    CREATE TABLE IF NOT EXISTS UserGoals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      steps INTEGER,
      distanceKm REAL,
      caloriesKcal INTEGER,
      durationMinutes INTEGER,
      timestamp INTEGER
    );
  `);

  console.log('All tables created successfully');
}

// Export db and executeSql for use in other files (UserDao, etc.)
export { db, executeSql };