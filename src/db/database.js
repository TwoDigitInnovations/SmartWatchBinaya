// import SQLite from 'react-native-sqlite-2'

// // SQLite.DEBUG(false);
// // SQLite.enablePromise(true);

// export const db = SQLite.openDatabase(
//     {
//         name: 'db_sample2.db',
//         location: 'default',
//     },
//     // () => console.log('DB opened'),
//     // error => console.log('DB error', error)
// );


import SQLite from 'react-native-sqlite-2';

// Open database - NO enablePromise, different syntax
export const db = SQLite.openDatabase(
    'smartwatch.db',  // name
    '1.0',           // version
    'Smartwatch DB', // description
    200000           // size
);