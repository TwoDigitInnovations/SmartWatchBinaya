// import { db } from './database';

// export async function createTables() {
//   const database = await db;

//   await database.transaction(tx => {

//     tx.executeSql(`
//       CREATE TABLE IF NOT EXISTS UserEntity (
//         id TEXT PRIMARY KEY,
//         name TEXT,
//         age INTEGER,
//         height INTEGER,
//         weight INTEGER,
//         gender TEXT,
//         userId TEXT UNIQUE,
//         email TEXT UNIQUE,
//         password TEXT,
//         code TEXT,
//         dob TEXT
//     );

//     `);

//     tx.executeSql(`
//       CREATE TABLE IF NOT EXISTS DeviceBindEntity (
//         id TEXT PRIMARY KEY,
//         deviceId TEXT
//       );
//     `);

//     tx.executeSql(`
//       CREATE TABLE IF NOT EXISTS StepItemEntity (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         steps INTEGER,
//         date TEXT
//       );
//     `);

//     tx.executeSql(`
//     CREATE TABLE IF NOT EXISTS HealthVitals (
//      id INTEGER PRIMARY KEY AUTOINCREMENT,
//      userId TEXT,
//      bpm INTEGER,
//      spO2 INTEGER,
//      systolic INTEGER,
//      diastolic INTEGER,
//      stressIndex INTEGER,
//      body REAL,
//      wrist REAL,
//      recordedAt INTEGER,
//      recordedDate TEXT,
//       UNIQUE(recordedDate)
//     );
//   `);

//     tx.executeSql(`
//     CREATE TABLE IF NOT EXISTS ActivitySummary (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//   userId TEXT,
//   steps INTEGER,
//   distanceKm REAL,
//   caloriesKcal INTEGER,
//   avgBPM INTEGER,
//   deepSleepMinutes INTEGER,
//   lightSleepMinutes INTEGER,
//   recordedDate TEXT,
//   recordedAt INTEGER,
//   UNIQUE(recordedDate)
//     );
//   `);

//     tx.executeSql(`
//     CREATE TABLE IF NOT EXISTS HourlyActivity (
//      id INTEGER PRIMARY KEY AUTOINCREMENT,
//      userId TEXT NOT NULL,
//      steps INTEGER DEFAULT 0,
//      calories INTEGER DEFAULT 0,
//      hour INTEGER NOT NULL,
//      recordedDate TEXT NOT NULL,
//      recordedAt INTEGER,
//      UNIQUE(userId, recordedDate, hour)
//     );
//   `);

//     tx.executeSql(`
//     CREATE TABLE IF NOT EXISTS UserGoals (
//    id INTEGER PRIMARY KEY AUTOINCREMENT,
//   userId TEXT ,
//   steps INTEGER,
//   distanceKm REAL,
//   caloriesKcal INTEGER,
//   durationMinutes INTEGER,
//   timestamp INTEGER
//     );
//   `);



//     // 👉 Continue for other entities
//   });
// }

import { db } from './database';

export async function createTables() {
  const database = await db;

  // Use executeSql directly with await, not transaction
  await database.executeSql(`
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

  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS DeviceBindEntity (
      id TEXT PRIMARY KEY,
      deviceId TEXT
    );
  `);

  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS StepItemEntity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      steps INTEGER,
      date TEXT
    );
  `);

  await database.executeSql(`
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

  await database.executeSql(`
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

  await database.executeSql(`
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

  await database.executeSql(`
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
