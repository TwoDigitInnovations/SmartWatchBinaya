import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

export const db = SQLite.openDatabase(
    {
        name: 'db_sample2.db',
        location: 'default',
    },
    // () => console.log('DB opened'),
    // error => console.log('DB error', error)
);
