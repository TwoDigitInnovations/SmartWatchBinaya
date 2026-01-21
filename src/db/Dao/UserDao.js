import { db } from '../database';
import { hashPassword } from '../PasswordUtils';
import { createTables } from '../schema';

export const insert = async (user) => {
    const database = await db;
    return database.executeSql(
        `INSERT OR REPLACE INTO UserEntity (userId, code) VALUES (?, ?)`,
        [user.userId, user.code]
    );
}

export const signUp = async (user) => {
    const database = await db;
    const hashedPassword = await hashPassword(user.password);

    return database.executeSql(
        `INSERT INTO UserEntity
     (id, name, age, height, weight, gender, userId, password)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user.id,
            user.name,
            user.age,
            user.height,
            user.weight,
            user.gender,
            user.userId,
            hashedPassword
        ]
    );
};

export const signIn = async (userId, password) => {
    const database = await db;
    const hashedPassword = await hashPassword(password);

    const [result] = await database.executeSql(
        `SELECT * FROM UserEntity WHERE userId = ? AND password = ?`,
        [userId, hashedPassword]
    );

    if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
    }

    return result.rows.item(0); // logged-in user
};


export const getUser = async () => {
    const database = await db;
    const [result] = await database.executeSql(
        `SELECT * FROM UserEntity LIMIT 1`
    );

    return result.rows.length ? result.rows.item(0) : null;
}


export const getUserById = async (userId) => {
    // deleteUser(userId)
    const database = await db;
    // await database.executeSql(`DROP TABLE IF EXISTS HealthVitals`);
    // await database.executeSql(`DROP TABLE IF EXISTS ActivitySummary`);
    // await database.executeSql(`DROP TABLE IF EXISTS UserGoals`);
    // await database.executeSql(`DROP TABLE IF EXISTS UserEntity`);


    const [result] = await database.executeSql(
        `SELECT 
        id,
        name,
        age,
        height,
        weight,
        gender,
        userId,
        email,
        dob,
        avatar
     FROM UserEntity
     WHERE userId = ?`,
        [userId]
    );

    if (result.rows.length === 0) {
        return null; // user not found
    }

    return result.rows.item(0);
};


export const getUserByUserId = async (userId) => {
    const database = await db;

    const [result] = await database.executeSql(
        `SELECT 
            id,
            name,
            age,
            height,
            weight,
            gender,
            userId,
            email
         FROM UserEntity
         WHERE userId = ?`,
        [userId]
    );

    if (result.rows.length === 0) {
        return null; // user not found
    }

    return result.rows.item(0);
};


export const insertUser = async (user) => {
    await clear();
    console.log("Inserting user:", user);
    const database = await db;

    const avatar =
        typeof user.avatar === 'object'
            ? JSON.stringify(user.avatar)
            : user.avatar ?? null;
    console.log("Inserting avatar:", user);
    return database.executeSql(
        `INSERT INTO UserEntity 
        (name, age, height, weight, gender, userId, email, code, dob, avatar, id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user.name,
            user.age,
            user.height,
            user.weight,
            user.gender,
            user.userId,
            user.email,
            user.code,
            user.dob,
            avatar,
            user.id
        ]
    );
};



export const updateUser = async (userId, updates) => {
    const database = await db;

    if (updates.password) {
        updates.password = await hashPassword(updates.password);
    }

    const keys = Object.keys(updates);
    if (keys.length === 0) return;

    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => updates[key]);

    // ✅ IMPORTANT
    values.push(userId);

    return database.executeSql(
        `UPDATE UserEntity SET ${setClause} WHERE userId = ?`,
        values
    );
};


export const clear = async () => {
    const database = await db;
    await database.executeSql(`DROP TABLE IF EXISTS UserEntity`);
    await createTables().catch(error => {
        console.error('Error creating tables:', error);
    })
    // return database.executeSql(`DELETE FROM UserEntity`);
}

export const getAllUsers = async () => {
    const database = await db;
    const [result] = await database.executeSql(
        `SELECT 
            id,
            name,
            age,
            height,
            weight,
            gender,
            userId,
            email,
            code,
            dob,
            avatar
         FROM UserEntity`
    );

    // Convert result to array
    const users = [];
    for (let i = 0; i < result.rows.length; i++) {
        users.push(result.rows.item(i));
    }

    return users;
};

export const deleteUser = async (userId) => {
    try {
        console.log("Deleting user:", userId);
        const database = await db;
        const result = await database.executeSql(
            `DELETE FROM UserEntity WHERE userId = ?`,
            [userId]
        );
        console.log("User deleted successfully");
        return result;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};

