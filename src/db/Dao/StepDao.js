// import { getLastMonthRange, getLastWeekRange, getMonthStart, getToday, getWeekStart } from '../../assets/Helpers/constant';
// import { db } from '../database';

// export const insertHealthVitals = async (data) => {
//     try {
//         const v = data;
//         const database = await db;
//         console.log(v);

//         const now = Date.now();
//         const date = new Date().toISOString().split('T')[0];

//         // Check if record exists for this user and date
//         const [checkRes] = await database.executeSql(
//             `SELECT id FROM HealthVitals 
//              WHERE userId = ? AND recordedDate = ?`,
//             [v.userId, date]
//         );

//         if (checkRes.rows.length > 0) {
//             // Update existing record
//             const result = await database.executeSql(
//                 `UPDATE HealthVitals
//                  SET bpm = ?,
//                      spO2 = ?,
//                      systolic = ?,
//                      diastolic = ?,
//                      stressIndex = ?,
//                      body = ?,
//                      wrist = ?,
//                      recordedAt = ?
//                  WHERE userId = ? AND recordedDate = ?`,
//                 [
//                     v.bpm,
//                     v.spO2,
//                     v.systolic,
//                     v.diastolic,
//                     v.stressIndex,
//                     v.body,
//                     v.wrist,
//                     now,
//                     v.userId,
//                     date
//                 ]
//             );

//             return {
//                 success: true,
//                 action: 'updated',
//                 id: checkRes.rows.item(0).id
//             };
//         } else {
//             // Insert new record
//             const result = await database.executeSql(
//                 `INSERT INTO HealthVitals
//                  (userId, bpm, spO2, systolic, diastolic, stressIndex, body, wrist, recordedAt, recordedDate)
//                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//                 [
//                     v.userId,
//                     v.bpm,
//                     v.spO2,
//                     v.systolic,
//                     v.diastolic,
//                     v.stressIndex,
//                     v.body,
//                     v.wrist,
//                     now,
//                     date
//                 ]
//             );

//             return {
//                 success: true,
//                 action: 'inserted',
//                 insertId: result[0].insertId
//             };
//         }
//     } catch (error) {
//         console.error('Error inserting/updating health vitals:', error);
//         return {
//             success: false,
//             error: error.message
//         };
//     }
// };


// export const insertTodaySummary = async (data) => {
//     try {
//         console.log("Inserting/updating today's summary data:", data);
//         const t = data;
//         const database = await db;

//         const now = Date.now();
//         const todayDate = new Date().toISOString().split('T')[0];

//         // Check if record exists for this user and date
//         const [checkRes] = await database.executeSql(
//             `SELECT id FROM ActivitySummary 
//              WHERE userId = ? AND recordedDate = ?`,
//             [t.userId, todayDate]
//         );

//         if (checkRes.rows.length > 0) {
//             // Update existing record
//             const result = await database.executeSql(
//                 `UPDATE ActivitySummary
//                  SET steps = ?,
//                      distanceKm = ?,
//                      caloriesKcal = ?,
//                      avgBPM = ?,
//                      deepSleepMinutes = ?,
//                      lightSleepMinutes = ?,
//                      recordedAt = ?
//                  WHERE userId = ? AND recordedDate = ?`,
//                 [
//                     t.steps,
//                     t.distanceKm,
//                     t.caloriesKcal,
//                     t.avgBPM,
//                     t.deepSleepMinutes,
//                     t.lightSleepMinutes,
//                     now,
//                     t.userId,
//                     todayDate
//                 ]
//             );

//             console.log("Updated existing record");
//             return {
//                 success: true,
//                 action: 'updated',
//                 id: checkRes.rows.item(0).id
//             };
//         } else {
//             // Insert new record
//             const result = await database.executeSql(
//                 `INSERT INTO ActivitySummary
//                  (userId, steps, distanceKm, caloriesKcal, avgBPM,
//                   deepSleepMinutes, lightSleepMinutes, recordedDate, recordedAt)
//                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//                 [
//                     t.userId,
//                     t.steps,
//                     t.distanceKm,
//                     t.caloriesKcal,
//                     t.avgBPM,
//                     t.deepSleepMinutes,
//                     t.lightSleepMinutes,
//                     todayDate,
//                     now
//                 ]
//             );

//             console.log("Inserted new record");
//             return {
//                 success: true,
//                 action: 'inserted',
//                 insertId: result[0].insertId
//             };
//         }
//     } catch (error) {
//         console.error('Error inserting/updating activity summary:', error);
//         return {
//             success: false,
//             error: error.message
//         };
//     }
// };

// // database.js
// export const insertHourlyActivity = async (userId, steps, calories) => {
//     try {
//         const database = await db;
//         const now = new Date();
//         const currentHour = now.getHours(); // 0-23
//         const today = now.toISOString().split('T')[0];
//         const timestamp = Date.now();

//         const result = await database.executeSql(
//             `INSERT OR REPLACE INTO HourlyActivity
//              (userId, steps, calories, hour, recordedDate, recordedAt)
//              VALUES (?, ?, ?, ?, ?, ?)`,
//             [userId, steps, calories, currentHour, today, timestamp]
//         );

//         console.log(`Hourly data saved for hour ${currentHour}`);
//         return {
//             success: true,
//             hour: currentHour,
//             insertId: result[0].insertId
//         };
//     } catch (error) {
//         console.error('Error inserting hourly activity:', error);
//         return {
//             success: false,
//             error: error.message
//         };
//     }
// };

// export const getTodayHourlyActivity = async (userId) => {
//     const database = await db;
//     const today = new Date().toISOString().split('T')[0];

//     try {
//         const [res] = await database.executeSql(
//             `SELECT hour, steps, calories
//              FROM HourlyActivity
//              WHERE userId = ?
//                AND recordedDate = ?
//              ORDER BY hour ASC`,
//             [userId, today]
//         );

//         const rows = res.rows.raw();

//         // Fill in missing hours with 0 values
//         const hourlyData = Array(24).fill(null).map((_, hour) => {
//             const found = rows.find(r => r.hour === hour);
//             return {
//                 hour,
//                 steps: found?.steps || 0,
//                 calories: found?.calories || 0
//             };
//         });

//         return hourlyData;
//     } catch (error) {
//         console.error('Error getting hourly activity:', error);
//         return [];
//     }
// };

// export const getHourlyActivityForChart = async (userId) => {
//     const hourlyData = await getTodayHourlyActivity(userId);
//     const currentHour = new Date().getHours();

//     // Only show hours up to current hour
//     const relevantData = hourlyData.slice(0, currentHour + 1);

//     // Format labels properly
//     const formatHour = (hour) => {
//         if (hour === 0) return '12AM';
//         if (hour < 12) return `${hour}AM`;
//         if (hour === 12) return '12PM';
//         return `${hour - 12}PM`;
//     };

//     return {
//         labels: relevantData.map(d => formatHour(d.hour)),
//         steps: relevantData.map(d => d.steps),
//         calories: relevantData.map(d => d.calories)
//     };
// };

// // Get last 24 hours (including previous day if needed)
// export const getLast24HoursActivity = async (userId) => {
//     const database = await db;
//     const now = new Date();
//     const currentHour = now.getHours();
//     const today = now.toISOString().split('T')[0];

//     const yesterday = new Date(now);
//     yesterday.setDate(yesterday.getDate() - 1);
//     const yesterdayStr = yesterday.toISOString().split('T')[0];

//     try {
//         const [res] = await database.executeSql(
//             `SELECT hour, steps, calories, recordedDate
//              FROM HourlyActivity
//              WHERE userId = ?
//                AND (
//                  (recordedDate = ? AND hour > ?) OR
//                  (recordedDate = ? AND hour <= ?)
//                )
//              ORDER BY recordedDate ASC, hour ASC`,
//             [userId, yesterdayStr, currentHour, today, currentHour]
//         );

//         return res.rows.raw();
//     } catch (error) {
//         console.error('Error getting last 24 hours:', error);
//         return [];
//     }
// };


// export const insertGoals = async (data) => {
//     const g = data;
//     const database = await db;
//     await database.executeSql(
//         `INSERT INTO UserGoals
//      (userId, steps, distanceKm, caloriesKcal, durationMinutes, timestamp)
//      VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//             g.userId,
//             g.steps,
//             g.distanceKm,
//             g.caloriesKcal,
//             g.durationMinutes,
//             g.timestamp
//         ]
//     );
// };
// // Helper functions to get today's, week's, and month's vitals
// export const getTodayActivity = async (userId) => {
//     const today = getToday();
//     const database = await db;
//     const [res] = await database.executeSql(
//         `SELECT * FROM ActivitySummary
//      WHERE userId = ? AND recordedDate = ?`,
//         [userId, today]
//     );

//     return res.rows.length ? res.rows.item(0) : null;
// };

// // Get all activity data for a user
// export const getAllActivity = async (userId) => {
//     const database = await db;

//     try {
//         const [res] = await database.executeSql(
//             `SELECT *
//              FROM ActivitySummary
//              WHERE userId = ?
//              ORDER BY recordedDate DESC`,
//             [userId]
//         );

//         return res.rows.raw();
//     } catch (error) {
//         console.error('Error getting all activity:', error);
//         return [];
//     }
// };

// // Get activity data with date range filter
// export const getActivityByDateRange = async (userId, startDate, endDate) => {
//     const database = await db;

//     try {
//         const [res] = await database.executeSql(
//             `SELECT *
//              FROM ActivitySummary
//              WHERE userId = ?
//                AND recordedDate >= ?
//                AND recordedDate <= ?
//              ORDER BY recordedDate DESC`,
//             [userId, startDate, endDate]
//         );

//         return res.rows.raw();
//     } catch (error) {
//         console.error('Error getting activity by date range:', error);
//         return [];
//     }
// };

// // Get activity data with pagination
// export const getActivityPaginated = async (userId, limit = 10, offset = 0) => {
//     const database = await db;

//     try {
//         const [res] = await database.executeSql(
//             `SELECT *
//              FROM ActivitySummary
//              WHERE userId = ?
//              ORDER BY recordedDate DESC
//              LIMIT ? OFFSET ?`,
//             [userId, limit, offset]
//         );

//         return res.rows.raw();
//     } catch (error) {
//         console.error('Error getting paginated activity:', error);
//         return [];
//     }
// };

// // Get activity summary statistics
// export const getActivityStats = async (userId) => {
//     const database = await db;

//     try {
//         const [res] = await database.executeSql(
//             `SELECT
//                COUNT(*) as totalDays,
//                SUM(steps) as totalSteps,
//                AVG(steps) as avgSteps,
//                MAX(steps) as maxSteps,
//                MIN(steps) as minSteps
//              FROM ActivitySummary
//              WHERE userId = ?`,
//             [userId]
//         );

//         return res.rows.item(0);
//     } catch (error) {
//         console.error('Error getting activity stats:', error);
//         return null;
//     }
// };

// // Get latest activity record
// export const getLatestActivity = async (userId) => {
//     const database = await db;

//     try {
//         const [res] = await database.executeSql(
//             `SELECT *
//              FROM ActivitySummary
//              WHERE userId = ?
//              ORDER BY recordedDate DESC
//              LIMIT 1`,
//             [userId]
//         );

//         return res.rows.length > 0 ? res.rows.item(0) : null;
//     } catch (error) {
//         console.error('Error getting latest activity:', error);
//         return null;
//     }
// };

// // Get activity for specific date
// export const getActivityByDate = async (userId, date) => {
//     const database = await db;

//     try {
//         const [res] = await database.executeSql(
//             `SELECT *
//              FROM ActivitySummary
//              WHERE userId = ?
//                AND recordedDate = ?`,
//             [userId, date]
//         );

//         return res.rows.length > 0 ? res.rows.item(0) : null;
//     } catch (error) {
//         console.error('Error getting activity by date:', error);
//         return null;
//     }
// };


// export const getWeeklyActivity = async (userId) => {
//     console.log("Fetching weekly activity for userId:", userId);
//     const { start, end } = getLastWeekRange();
//     const database = await db;

//     const [res] = await database.executeSql(
//         `SELECT
//        recordedDate,
//        SUM(steps) as steps
//      FROM ActivitySummary
//      WHERE userId = ?
//        AND recordedDate >= ?
//        AND recordedDate <= ?
//      GROUP BY recordedDate
//      ORDER BY recordedDate`,
//         [userId, start, end]
//     );

//     const rows = res.rows.raw();
//     console.log("Weekly activity rows fetched:", rows);
//     // Ensure we have all 7 days, even if some have no data
//     const dateMap = {};

//     rows.forEach(r => {
//         dateMap[r.recordedDate] = r.steps || 0;
//     });

//     // Generate labels and data for all 7 days
//     const labels = [];
//     const data = [];
//     const startDate = new Date(start);

//     for (let i = 0; i < 7; i++) {
//         const currentDate = new Date(startDate);
//         currentDate.setDate(startDate.getDate() + i);
//         const dateStr = currentDate.toISOString().split('T')[0];

//         labels.push(currentDate.toLocaleDateString('en-US', {
//             weekday: 'short',
//         }));

//         data.push(dateMap[dateStr] || 0);
//     }

//     return {
//         labels,
//         datasets: [
//             {
//                 data,
//                 strokeWidth: 2,
//             },
//         ],
//     };
// };



// export const getMonthlyActivity = async (userId) => {
//     const { start, end } = getLastMonthRange();
//     const database = await db;

//     const [res] = await database.executeSql(
//         `SELECT
//        recordedDate,
//        SUM(steps) as steps
//      FROM ActivitySummary
//      WHERE userId = ?
//        AND recordedDate >= ?
//        AND recordedDate <= ?
//      GROUP BY recordedDate
//      ORDER BY recordedDate`,
//         [userId, start, end]
//     );

//     const rows = res.rows.raw();

//     // Create a map of existing data
//     const dateMap = {};
//     rows.forEach(r => {
//         dateMap[r.recordedDate] = r.steps || 0;
//     });

//     // Generate labels and data for all days in the month
//     const labels = [];
//     const data = [];
//     const startDate = new Date(start);
//     const endDate = new Date(end);

//     const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

//     for (let i = 0; i < daysDiff; i++) {
//         const currentDate = new Date(startDate);
//         currentDate.setDate(startDate.getDate() + i);
//         const dateStr = currentDate.toISOString().split('T')[0];

//         // For monthly view, show date number (1, 2, 3, etc.)
//         labels.push(currentDate.getDate().toString());

//         data.push(dateMap[dateStr] || 0);
//     }

//     return {
//         labels,
//         datasets: [
//             {
//                 data,
//                 strokeWidth: 2,
//             },
//         ],
//     };
// };

// // Helper function to get last month's date range


// // Helper functions to get date strings
// export const getTodayVitals = async (userId) => {
//     const today = getToday();
//     const database = await db;
//     const [res] = await database.executeSql(
//         `SELECT * FROM HealthVitals
//      WHERE userId = ? AND recordedDate = ?
//      ORDER BY recordedAt DESC
//      LIMIT 1`,
//         [userId, today]
//     );

//     return res.rows.length ? res.rows.item(0) : null;
// };

// export const getWeeklyVitals = async (userId) => {
//     const start = getWeekStart();
//     const database = await db;
//     const [res] = await database.executeSql(
//         `SELECT
//        AVG(bpm) as bpm,
//        AVG(spO2) as spO2,
//        AVG(systolic) as systolic,
//        AVG(diastolic) as diastolic
//      FROM HealthVitals
//      WHERE userId = ? AND recordedDate >= ?`,
//         [userId, start]
//     );

//     return res.rows.item(0);
// };

// export const getMonthlyVitals = async (userId) => {
//     const start = getMonthStart();
//     const database = await db;
//     const [res] = await database.executeSql(
//         `SELECT
//        AVG(bpm) as bpm,
//        AVG(spO2) as spO2,
//        AVG(stressIndex) as stressIndex
//         FROM HealthVitals
//         WHERE userId = ? AND recordedDate >= ?`,
//         [userId, start]
//     );

//     return res.rows.item(0);
// };

// // Get today's totals
// export const getTodayTotals = async (userId) => {
//     const database = await db;
//     const today = new Date().toISOString().split('T')[0];

//     try {
//         const [res] = await database.executeSql(
//             `SELECT
//                COALESCE(SUM(steps), 0) as totalSteps,
//                COALESCE(SUM(distanceKm), 0) as totalDistance,
//                COALESCE(SUM(caloriesKcal), 0) as totalCalories
//              FROM ActivitySummary
//              WHERE userId = ?
//                AND recordedDate = ?`,
//             [userId, today]
//         );

//         const result = res.rows.item(0);
//         console.log('Today totals:', result);

//         return {
//             steps: result.totalSteps || 0,
//             distance: result.totalDistance || 0,
//             calories: result.totalCalories || 0
//         };
//     } catch (error) {
//         console.error('Error getting today totals:', error);
//         return { steps: 0, distance: 0, calories: 0 };
//     }
// };

// // Get this week's totals (last 7 days)
// export const getWeeklyTotals = async (userId) => {
//     const database = await db;

//     const end = new Date();
//     end.setHours(23, 59, 59, 999);

//     const start = new Date(end);
//     start.setDate(start.getDate() - 6);
//     start.setHours(0, 0, 0, 0);

//     const startStr = start.toISOString().split('T')[0];
//     const endStr = end.toISOString().split('T')[0];

//     try {
//         const [res] = await database.executeSql(
//             `SELECT
//                COALESCE(SUM(steps), 0) as totalSteps,
//                COALESCE(SUM(distanceKm), 0) as totalDistance,
//                COALESCE(SUM(caloriesKcal), 0) as totalCalories
//              FROM ActivitySummary
//              WHERE userId = ?
//                AND recordedDate >= ?
//                AND recordedDate <= ?`,
//             [userId, startStr, endStr]
//         );

//         const result = res.rows.item(0);
//         console.log('Weekly totals:', result);

//         return {
//             steps: result.totalSteps || 0,
//             distance: result.totalDistance || 0,
//             calories: result.totalCalories || 0
//         };
//     } catch (error) {
//         console.error('Error getting weekly totals:', error);
//         return { steps: 0, distance: 0, calories: 0 };
//     }
// };

// // Get this month's totals (last 30 days)
// export const getMonthlyTotals = async (userId) => {
//     const database = await db;

//     const end = new Date();
//     end.setHours(23, 59, 59, 999);

//     const start = new Date(end);
//     start.setDate(start.getDate() - 29);
//     start.setHours(0, 0, 0, 0);

//     const startStr = start.toISOString().split('T')[0];
//     const endStr = end.toISOString().split('T')[0];

//     try {
//         const [res] = await database.executeSql(
//             `SELECT
//                COALESCE(SUM(steps), 0) as totalSteps,
//                COALESCE(SUM(distanceKm), 0) as totalDistance,
//                COALESCE(SUM(caloriesKcal), 0) as totalCalories
//              FROM ActivitySummary
//              WHERE userId = ?
//                AND recordedDate >= ?
//                AND recordedDate <= ?`,
//             [userId, startStr, endStr]
//         );

//         const result = res.rows.item(0);
//         console.log('Monthly totals:', result);

//         return {
//             steps: result.totalSteps || 0,
//             distance: result.totalDistance || 0,
//             calories: result.totalCalories || 0
//         };
//     } catch (error) {
//         console.error('Error getting monthly totals:', error);
//         return { steps: 0, distance: 0, calories: 0 };
//     }
// };

// // Get all three periods at once (more efficient)
// export const getAllPeriodTotals = async (userId) => {
//     const today = new Date().toISOString().split('T')[0];

//     const weekEnd = new Date();
//     const weekStart = new Date(weekEnd);
//     weekStart.setDate(weekStart.getDate() - 6);

//     const monthEnd = new Date();
//     const monthStart = new Date(monthEnd);
//     monthStart.setDate(monthStart.getDate() - 29);

//     const database = await db;

//     try {
//         // Get today
//         const [todayRes] = await database.executeSql(
//             `SELECT
//                COALESCE(SUM(steps), 0) as totalSteps,
//                COALESCE(SUM(distanceKm), 0) as totalDistance,
//                COALESCE(SUM(caloriesKcal), 0) as totalCalories
//              FROM ActivitySummary
//              WHERE userId = ? AND recordedDate = ?`,
//             [userId, today]
//         );

//         // Get week
//         const [weekRes] = await database.executeSql(
//             `SELECT
//                COALESCE(SUM(steps), 0) as totalSteps,
//                COALESCE(SUM(distanceKm), 0) as totalDistance,
//                COALESCE(SUM(caloriesKcal), 0) as totalCalories
//              FROM ActivitySummary
//              WHERE userId = ? 
//                AND recordedDate >= ? 
//                AND recordedDate <= ?`,
//             [userId, weekStart.toISOString().split('T')[0], today]
//         );

//         // Get month
//         const [monthRes] = await database.executeSql(
//             `SELECT
//                COALESCE(SUM(steps), 0) as totalSteps,
//                COALESCE(SUM(distanceKm), 0) as totalDistance,
//                COALESCE(SUM(caloriesKcal), 0) as totalCalories
//              FROM ActivitySummary
//              WHERE userId = ? 
//                AND recordedDate >= ? 
//                AND recordedDate <= ?`,
//             [userId, monthStart.toISOString().split('T')[0], today]
//         );

//         const todayData = todayRes.rows.item(0);
//         const weekData = weekRes.rows.item(0);
//         const monthData = monthRes.rows.item(0);

//         return {
//             today: {
//                 steps: todayData.totalSteps || 0,
//                 distance: todayData.totalDistance || 0,
//                 calories: todayData.totalCalories || 0
//             },
//             week: {
//                 steps: weekData.totalSteps || 0,
//                 distance: weekData.totalDistance || 0,
//                 calories: weekData.totalCalories || 0
//             },
//             month: {
//                 steps: monthData.totalSteps || 0,
//                 distance: monthData.totalDistance || 0,
//                 calories: monthData.totalCalories || 0
//             }
//         };
//     } catch (error) {
//         console.error('Error getting all period totals:', error);
//         return {
//             today: { steps: 0, distance: 0, calories: 0 },
//             week: { steps: 0, distance: 0, calories: 0 },
//             month: { steps: 0, distance: 0, calories: 0 }
//         };
//     }
// };

// // Get last 6 hours of activity data
// export const getLast6HoursActivity = async (userId) => {
//     const database = await db;
//     const now = new Date();
//     const currentHour = now.getHours();
//     const today = now.toISOString().split('T')[0];

//     // Calculate if we need data from yesterday
//     const hoursNeeded = 6;
//     const startHour = currentHour - (hoursNeeded - 1);

//     try {
//         let query, params;

//         if (startHour >= 0) {
//             // All hours are from today
//             const [res] = await database.executeSql(
//                 `SELECT hour, steps, calories
//                  FROM HourlyActivity
//                  WHERE userId = ?
//                    AND recordedDate = ?
//                    AND hour >= ?
//                    AND hour <= ?
//                  ORDER BY hour ASC`,
//                 [userId, today, startHour, currentHour]
//             );

//             const rows = res.rows.raw();

//             // Fill missing hours
//             const last6Hours = [];
//             for (let i = 0; i < hoursNeeded; i++) {
//                 const hour = startHour + i;
//                 const found = rows.find(r => r.hour === hour);
//                 last6Hours.push({
//                     hour,
//                     steps: found?.steps || 0,
//                     calories: found?.calories || 0,
//                     date: today
//                 });
//             }

//             return last6Hours;
//         } else {
//             // Need data from yesterday and today
//             const yesterday = new Date(now);
//             yesterday.setDate(yesterday.getDate() - 1);
//             const yesterdayStr = yesterday.toISOString().split('T')[0];

//             const yesterdayStartHour = 24 + startHour; // Convert negative to yesterday's hour

//             const [res] = await database.executeSql(
//                 `SELECT hour, steps, calories, recordedDate
//                  FROM HourlyActivity
//                  WHERE userId = ?
//                    AND (
//                      (recordedDate = ? AND hour >= ?) OR
//                      (recordedDate = ? AND hour <= ?)
//                    )
//                  ORDER BY recordedDate ASC, hour ASC`,
//                 [userId, yesterdayStr, yesterdayStartHour, today, currentHour]
//             );

//             const rows = res.rows.raw();

//             // Fill missing hours from yesterday and today
//             const last6Hours = [];

//             // Add yesterday's hours
//             for (let i = yesterdayStartHour; i < 24; i++) {
//                 const found = rows.find(r => r.hour === i && r.recordedDate === yesterdayStr);
//                 last6Hours.push({
//                     hour: i,
//                     steps: found?.steps || 0,
//                     calories: found?.calories || 0,
//                     date: yesterdayStr
//                 });
//             }

//             // Add today's hours
//             for (let i = 0; i <= currentHour; i++) {
//                 const found = rows.find(r => r.hour === i && r.recordedDate === today);
//                 last6Hours.push({
//                     hour: i,
//                     steps: found?.steps || 0,
//                     calories: found?.calories || 0,
//                     date: today
//                 });
//             }

//             // Return only last 6 hours
//             return last6Hours.slice(-hoursNeeded);
//         }
//     } catch (error) {
//         console.error('Error getting last 6 hours activity:', error);
//         return [];
//     }
// };

// // Format last 6 hours data for chart
// export const getLast6HoursForChart = async (userId) => {
//     const last6Hours = await getLast6HoursActivity(userId);

//     const formatHour = (hour) => {
//         if (hour === 0) return '12AM';
//         if (hour < 12) return `${hour}AM`;
//         if (hour === 12) return '12PM';
//         return `${hour - 12}PM`;
//     };

//     return {
//         labels: last6Hours.map(d => formatHour(d.hour)),
//         steps: last6Hours.map(d => d.steps),
//         calories: last6Hours.map(d => d.calories)
//     };
// };

// // Get hourly activity timeline
// export const getHourlyActivityTimeline = async (userId) => {
//     const database = await db;
//     const now = new Date();
//     const today = now.toISOString().split('T')[0];

//     try {
//         const [res] = await database.executeSql(
//             `SELECT hour, steps, calories
//              FROM HourlyActivity
//              WHERE userId = ?
//                AND recordedDate = ?
//              ORDER BY hour ASC`,
//             [userId, today]
//         );

//         const rows = res.rows.raw();

//         // Create 24-hour timeline
//         const timeline = Array(24).fill(null).map((_, hour) => {
//             const found = rows.find(r => r.hour === hour);
//             return {
//                 hour,
//                 steps: found?.steps || 0,
//                 calories: found?.calories || 0,
//                 duration: 60 // Each block represents 60 minutes
//             };
//         });

//         // Group consecutive similar activity levels
//         const groupedTimeline = groupActivityBlocks(timeline);

//         // Calculate total active duration
//         const totalActiveMinutes = timeline.reduce((sum, item) => {
//             return sum + (item.steps > 0 ? 60 : 0);
//         }, 0);

//         const totalHours = Math.floor(totalActiveMinutes / 60);
//         const totalMinutes = totalActiveMinutes % 60;

//         return {
//             timeline: groupedTimeline,
//             totalDuration: {
//                 hours: totalHours,
//                 minutes: totalMinutes
//             }
//         };
//     } catch (error) {
//         console.error('Error getting activity timeline:', error);
//         return {
//             timeline: [],
//             totalDuration: { hours: 0, minutes: 0 }
//         };
//     }
// };

// // Group consecutive similar activity blocks
// const groupActivityBlocks = (timeline) => {
//     if (timeline.length === 0) return [];

//     const grouped = [];
//     let currentGroup = {
//         startHour: timeline[0].hour,
//         steps: timeline[0].steps,
//         calories: timeline[0].calories,
//         duration: 60
//     };

//     const getActivityLevel = (steps) => {
//         if (steps === 0) return 0;
//         if (steps < 500) return 1;
//         if (steps < 1000) return 2;
//         return 3;
//     };

//     for (let i = 1; i < timeline.length; i++) {
//         const currentLevel = getActivityLevel(timeline[i].steps);
//         const groupLevel = getActivityLevel(currentGroup.steps);

//         if (currentLevel === groupLevel) {
//             // Same activity level, extend current group
//             currentGroup.duration += 60;
//             currentGroup.steps += timeline[i].steps;
//             currentGroup.calories += timeline[i].calories;
//         } else {
//             // Different activity level, start new group
//             grouped.push(currentGroup);
//             currentGroup = {
//                 startHour: timeline[i].hour,
//                 steps: timeline[i].steps,
//                 calories: timeline[i].calories,
//                 duration: 60
//             };
//         }
//     }

//     // Add the last group
//     grouped.push(currentGroup);

//     return grouped;
// };

// // Get activity for specific time range
// export const getActivityTimeRange = async (userId, startHour, endHour) => {
//     const database = await db;
//     const today = new Date().toISOString().split('T')[0];

//     try {
//         const [res] = await database.executeSql(
//             `SELECT hour, steps, calories
//              FROM HourlyActivity
//              WHERE userId = ?
//                AND recordedDate = ?
//                AND hour BETWEEN ? AND ?
//              ORDER BY hour ASC`,
//             [userId, today, startHour, endHour]
//         );

//         return res.rows.raw();
//     } catch (error) {
//         console.error('Error getting time range activity:', error);
//         return [];
//     }
// };



// // Get blood pressure data for chart
// export const getBloodPressureData = async (userId, days = 7) => {
//     const database = await db;
//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - days);
//     const startDateString = startDate.toISOString().split('T')[0];

//     const [result] = await database.executeSql(
//         `SELECT recordedDate, systolic, diastolic, recordedAt 
//          FROM HealthVitals 
//          WHERE userId = ? AND recordedDate >= ?
//          ORDER BY recordedAt ASC`,
//         [userId, startDateString]
//     );

//     const data = [];
//     for (let i = 0; i < result.rows.length; i++) {
//         data.push(result.rows.item(i));
//     }

//     return data;
// };

// export const getWeeklyBloodPressure = async (userId) => {
//     console.log("Fetching weekly blood pressure for userId:", userId);
//     const { start, end } = getLastWeekRange();
//     const database = await db;

//     const [res] = await database.executeSql(
//         `SELECT
//        recordedDate,
//        systolic,
//        diastolic
//      FROM HealthVitals
//      WHERE userId = ?
//        AND recordedDate >= ?
//        AND recordedDate <= ?
//      ORDER BY recordedDate`,
//         [userId, start, end]
//     );

//     const rows = res.rows.raw();
//     console.log("Weekly blood pressure rows fetched:", rows);

//     // Ensure we have all 7 days, even if some have no data
//     const dateMap = {};

//     rows.forEach(r => {
//         dateMap[r.recordedDate] = {
//             systolic: r.systolic || 0,
//             diastolic: r.diastolic || 0
//         };
//     });

//     // Generate labels and data for all 7 days
//     const labels = [];
//     const systolicData = [];
//     const diastolicData = [];
//     const startDate = new Date(start);

//     for (let i = 0; i < 7; i++) {
//         const currentDate = new Date(startDate);
//         currentDate.setDate(startDate.getDate() + i);
//         const dateStr = currentDate.toISOString().split('T')[0];

//         labels.push(currentDate.toLocaleDateString('en-US', {
//             weekday: 'short',
//         }));

//         const dayData = dateMap[dateStr];
//         systolicData.push(dayData ? dayData.systolic : 0);
//         diastolicData.push(dayData ? dayData.diastolic : 0);
//     }

//     return {
//         labels,
//         datasets: [
//             {
//                 data: systolicData,
//                 color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`, // Red for systolic
//                 strokeWidth: 2,
//             },
//             {
//                 data: diastolicData,
//                 color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`, // Teal for diastolic
//                 strokeWidth: 2,
//             }
//         ],
//     };
// };

// export const getWeeklySpO2 = async (userId) => {
//     console.log("Fetching weekly SpO2 for userId:", userId);
//     const { start, end } = getLastWeekRange();
//     const database = await db;

//     const [res] = await database.executeSql(
//         `SELECT
//        recordedDate,
//        spO2
//      FROM HealthVitals
//      WHERE userId = ?
//        AND recordedDate >= ?
//        AND recordedDate <= ?
//      ORDER BY recordedDate`,
//         [userId, start, end]
//     );

//     const rows = res.rows.raw();
//     console.log("Weekly SpO2 rows fetched:", rows);

//     const dateMap = {};

//     rows.forEach(r => {
//         dateMap[r.recordedDate] = r.spO2 || 0;
//     });

//     const labels = [];
//     const data = [];
//     const startDate = new Date(start);

//     for (let i = 0; i < 7; i++) {
//         const currentDate = new Date(startDate);
//         currentDate.setDate(startDate.getDate() + i);
//         const dateStr = currentDate.toISOString().split('T')[0];

//         labels.push(currentDate.toLocaleDateString('en-US', {
//             weekday: 'short',
//         }));

//         data.push(dateMap[dateStr] || 0);
//     }

//     return {
//         labels,
//         datasets: [
//             {
//                 data,
//                 strokeWidth: 2,
//             },
//         ],
//     };
// };

// export const getWeeklyHeartRate = async (userId) => {
//     console.log("Fetching weekly heart rate for userId:", userId);
//     const { start, end } = getLastWeekRange();
//     const database = await db;

//     const [res] = await database.executeSql(
//         `SELECT
//        recordedDate,
//        bpm
//      FROM HealthVitals
//      WHERE userId = ?
//        AND recordedDate >= ?
//        AND recordedDate <= ?
//      ORDER BY recordedDate`,
//         [userId, start, end]
//     );

//     const rows = res.rows.raw();
//     console.log("Weekly heart rate rows fetched:", rows);

//     const dateMap = {};

//     rows.forEach(r => {
//         dateMap[r.recordedDate] = r.bpm || 0;
//     });

//     const labels = [];
//     const data = [];
//     const startDate = new Date(start);

//     for (let i = 0; i < 7; i++) {
//         const currentDate = new Date(startDate);
//         currentDate.setDate(startDate.getDate() + i);
//         const dateStr = currentDate.toISOString().split('T')[0];

//         labels.push(currentDate.toLocaleDateString('en-US', {
//             weekday: 'short',
//         }));

//         data.push(dateMap[dateStr] || 0);
//     }

//     return {
//         labels,
//         datasets: [
//             {
//                 data,
//                 strokeWidth: 2,
//             },
//         ],
//     };
// };



import { getLastMonthRange, getLastWeekRange, getMonthStart, getToday, getWeekStart } from '../../assets/Helpers/constant';
import { db } from '../database';

// Helper: wrap transaction executeSql in a Promise
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

// Helper: convert rows to array (replaces res.rows.raw())
const rowsToArray = (result) => {
    const rows = [];
    for (let i = 0; i < result.rows.length; i++) {
        rows.push(result.rows.item(i));
    }
    return rows;
};

export const insertHealthVitals = async (data) => {
    try {
        const v = data;
        console.log(v);

        const now = Date.now();
        const date = new Date().toISOString().split('T')[0];

        const checkRes = await executeSql(
            `SELECT id FROM HealthVitals WHERE userId = ? AND recordedDate = ?`,
            [v.userId, date]
        );

        if (checkRes.rows.length > 0) {
            await executeSql(
                `UPDATE HealthVitals
                 SET bpm = ?, spO2 = ?, systolic = ?, diastolic = ?,
                     stressIndex = ?, body = ?, wrist = ?, recordedAt = ?
                 WHERE userId = ? AND recordedDate = ?`,
                [v.bpm, v.spO2, v.systolic, v.diastolic,
                v.stressIndex, v.body, v.wrist, now, v.userId, date]
            );
            return { success: true, action: 'updated', id: checkRes.rows.item(0).id };
        } else {
            const result = await executeSql(
                `INSERT INTO HealthVitals
                 (userId, bpm, spO2, systolic, diastolic, stressIndex, body, wrist, recordedAt, recordedDate)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [v.userId, v.bpm, v.spO2, v.systolic, v.diastolic,
                v.stressIndex, v.body, v.wrist, now, date]
            );
            return { success: true, action: 'inserted', insertId: result.insertId };
        }
    } catch (error) {
        console.error('Error inserting/updating health vitals:', error);
        return { success: false, error: error.message };
    }
};

export const insertTodaySummary = async (data) => {
    try {
        console.log("Inserting/updating today's summary data:", data);
        const t = data;
        const now = Date.now();
        const todayDate = new Date().toISOString().split('T')[0];

        const checkRes = await executeSql(
            `SELECT id FROM ActivitySummary WHERE userId = ? AND recordedDate = ?`,
            [t.userId, todayDate]
        );

        if (checkRes.rows.length > 0) {
            await executeSql(
                `UPDATE ActivitySummary
                 SET steps = ?, distanceKm = ?, caloriesKcal = ?, avgBPM = ?,
                     deepSleepMinutes = ?, lightSleepMinutes = ?, recordedAt = ?
                 WHERE userId = ? AND recordedDate = ?`,
                [t.steps, t.distanceKm, t.caloriesKcal, t.avgBPM,
                t.deepSleepMinutes, t.lightSleepMinutes, now, t.userId, todayDate]
            );
            console.log("Updated existing record");
            return { success: true, action: 'updated', id: checkRes.rows.item(0).id };
        } else {
            const result = await executeSql(
                `INSERT INTO ActivitySummary
                 (userId, steps, distanceKm, caloriesKcal, avgBPM,
                  deepSleepMinutes, lightSleepMinutes, recordedDate, recordedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [t.userId, t.steps, t.distanceKm, t.caloriesKcal, t.avgBPM,
                t.deepSleepMinutes, t.lightSleepMinutes, todayDate, now]
            );
            console.log("Inserted new record");
            return { success: true, action: 'inserted', insertId: result.insertId };
        }
    } catch (error) {
        console.error('Error inserting/updating activity summary:', error);
        return { success: false, error: error.message };
    }
};

export const insertHourlyActivity = async (userId, steps, calories) => {
    try {
        const now = new Date();
        const currentHour = now.getHours();
        const today = now.toISOString().split('T')[0];
        const timestamp = Date.now();

        const result = await executeSql(
            `INSERT OR REPLACE INTO HourlyActivity
             (userId, steps, calories, hour, recordedDate, recordedAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, steps, calories, currentHour, today, timestamp]
        );

        console.log(`Hourly data saved for hour ${currentHour}`);
        return { success: true, hour: currentHour, insertId: result.insertId };
    } catch (error) {
        console.error('Error inserting hourly activity:', error);
        return { success: false, error: error.message };
    }
};

export const getTodayHourlyActivity = async (userId) => {
    const today = new Date().toISOString().split('T')[0];

    try {
        const res = await executeSql(
            `SELECT hour, steps, calories FROM HourlyActivity
             WHERE userId = ? AND recordedDate = ? ORDER BY hour ASC`,
            [userId, today]
        );

        const rows = rowsToArray(res);

        const hourlyData = Array(24).fill(null).map((_, hour) => {
            const found = rows.find(r => r.hour === hour);
            return { hour, steps: found?.steps || 0, calories: found?.calories || 0 };
        });

        return hourlyData;
    } catch (error) {
        console.error('Error getting hourly activity:', error);
        return [];
    }
};

export const getHourlyActivityForChart = async (userId) => {
    const hourlyData = await getTodayHourlyActivity(userId);
    const currentHour = new Date().getHours();
    const relevantData = hourlyData.slice(0, currentHour + 1);

    const formatHour = (hour) => {
        if (hour === 0) return '12AM';
        if (hour < 12) return `${hour}AM`;
        if (hour === 12) return '12PM';
        return `${hour - 12}PM`;
    };

    return {
        labels: relevantData.map(d => formatHour(d.hour)),
        steps: relevantData.map(d => d.steps),
        calories: relevantData.map(d => d.calories)
    };
};

export const getLast24HoursActivity = async (userId) => {
    const now = new Date();
    const currentHour = now.getHours();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    try {
        const res = await executeSql(
            `SELECT hour, steps, calories, recordedDate FROM HourlyActivity
             WHERE userId = ?
               AND ((recordedDate = ? AND hour > ?) OR (recordedDate = ? AND hour <= ?))
             ORDER BY recordedDate ASC, hour ASC`,
            [userId, yesterdayStr, currentHour, today, currentHour]
        );
        return rowsToArray(res);
    } catch (error) {
        console.error('Error getting last 24 hours:', error);
        return [];
    }
};

export const insertGoals = async (data) => {
    const g = data;
    await executeSql(
        `INSERT INTO UserGoals
         (userId, steps, distanceKm, caloriesKcal, durationMinutes, timestamp)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [g.userId, g.steps, g.distanceKm, g.caloriesKcal, g.durationMinutes, g.timestamp]
    );
};

export const getTodayActivity = async (userId) => {
    const today = getToday();
    const res = await executeSql(
        `SELECT * FROM ActivitySummary WHERE userId = ? AND recordedDate = ?`,
        [userId, today]
    );
    return res.rows.length ? res.rows.item(0) : null;
};

export const getAllActivity = async (userId) => {
    try {
        const res = await executeSql(
            `SELECT * FROM ActivitySummary WHERE userId = ? ORDER BY recordedDate DESC`,
            [userId]
        );
        return rowsToArray(res);
    } catch (error) {
        console.error('Error getting all activity:', error);
        return [];
    }
};

export const getActivityByDateRange = async (userId, startDate, endDate) => {
    try {
        const res = await executeSql(
            `SELECT * FROM ActivitySummary
             WHERE userId = ? AND recordedDate >= ? AND recordedDate <= ?
             ORDER BY recordedDate DESC`,
            [userId, startDate, endDate]
        );
        return rowsToArray(res);
    } catch (error) {
        console.error('Error getting activity by date range:', error);
        return [];
    }
};

export const getActivityPaginated = async (userId, limit = 10, offset = 0) => {
    try {
        const res = await executeSql(
            `SELECT * FROM ActivitySummary WHERE userId = ?
             ORDER BY recordedDate DESC LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );
        return rowsToArray(res);
    } catch (error) {
        console.error('Error getting paginated activity:', error);
        return [];
    }
};

export const getActivityStats = async (userId) => {
    try {
        const res = await executeSql(
            `SELECT COUNT(*) as totalDays, SUM(steps) as totalSteps,
              AVG(steps) as avgSteps, MAX(steps) as maxSteps, MIN(steps) as minSteps
             FROM ActivitySummary WHERE userId = ?`,
            [userId]
        );
        return res.rows.item(0);
    } catch (error) {
        console.error('Error getting activity stats:', error);
        return null;
    }
};

export const getLatestActivity = async (userId) => {
    try {
        const res = await executeSql(
            `SELECT * FROM ActivitySummary WHERE userId = ?
             ORDER BY recordedDate DESC LIMIT 1`,
            [userId]
        );
        return res.rows.length > 0 ? res.rows.item(0) : null;
    } catch (error) {
        console.error('Error getting latest activity:', error);
        return null;
    }
};

export const getActivityByDate = async (userId, date) => {
    try {
        const res = await executeSql(
            `SELECT * FROM ActivitySummary WHERE userId = ? AND recordedDate = ?`,
            [userId, date]
        );
        return res.rows.length > 0 ? res.rows.item(0) : null;
    } catch (error) {
        console.error('Error getting activity by date:', error);
        return null;
    }
};

export const getWeeklyActivity = async (userId) => {
    console.log("Fetching weekly activity for userId:", userId);
    const { start, end } = getLastWeekRange();

    const res = await executeSql(
        `SELECT recordedDate, SUM(steps) as steps FROM ActivitySummary
         WHERE userId = ? AND recordedDate >= ? AND recordedDate <= ?
         GROUP BY recordedDate ORDER BY recordedDate`,
        [userId, start, end]
    );

    const rows = rowsToArray(res);
    console.log("Weekly activity rows fetched:", rows);

    const dateMap = {};
    rows.forEach(r => { dateMap[r.recordedDate] = r.steps || 0; });

    const labels = [];
    const data = [];
    const startDate = new Date(start);

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        labels.push(currentDate.toLocaleDateString('en-US', { weekday: 'short' }));
        data.push(dateMap[dateStr] || 0);
    }

    return { labels, datasets: [{ data, strokeWidth: 2 }] };
};

export const getMonthlyActivity = async (userId) => {
    const { start, end } = getLastMonthRange();

    const res = await executeSql(
        `SELECT recordedDate, SUM(steps) as steps FROM ActivitySummary
         WHERE userId = ? AND recordedDate >= ? AND recordedDate <= ?
         GROUP BY recordedDate ORDER BY recordedDate`,
        [userId, start, end]
    );

    const rows = rowsToArray(res);

    const dateMap = {};
    rows.forEach(r => { dateMap[r.recordedDate] = r.steps || 0; });

    const labels = [];
    const data = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < daysDiff; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        labels.push(currentDate.getDate().toString());
        data.push(dateMap[dateStr] || 0);
    }

    return { labels, datasets: [{ data, strokeWidth: 2 }] };
};

export const getTodayVitals = async (userId) => {
    const today = getToday();
    const res = await executeSql(
        `SELECT * FROM HealthVitals WHERE userId = ? AND recordedDate = ?
         ORDER BY recordedAt DESC LIMIT 1`,
        [userId, today]
    );
    return res.rows.length ? res.rows.item(0) : null;
};

export const getWeeklyVitals = async (userId) => {
    const start = getWeekStart();
    const res = await executeSql(
        `SELECT AVG(bpm) as bpm, AVG(spO2) as spO2,
          AVG(systolic) as systolic, AVG(diastolic) as diastolic
         FROM HealthVitals WHERE userId = ? AND recordedDate >= ?`,
        [userId, start]
    );
    return res.rows.item(0);
};

export const getMonthlyVitals = async (userId) => {
    const start = getMonthStart();
    const res = await executeSql(
        `SELECT AVG(bpm) as bpm, AVG(spO2) as spO2, AVG(stressIndex) as stressIndex
         FROM HealthVitals WHERE userId = ? AND recordedDate >= ?`,
        [userId, start]
    );
    return res.rows.item(0);
};

export const getTodayTotals = async (userId) => {
    const today = new Date().toISOString().split('T')[0];
    try {
        const res = await executeSql(
            `SELECT COALESCE(SUM(steps), 0) as totalSteps,
              COALESCE(SUM(distanceKm), 0) as totalDistance,
              COALESCE(SUM(caloriesKcal), 0) as totalCalories
             FROM ActivitySummary WHERE userId = ? AND recordedDate = ?`,
            [userId, today]
        );
        const result = res.rows.item(0);
        console.log('Today totals:', result);
        return { steps: result.totalSteps || 0, distance: result.totalDistance || 0, calories: result.totalCalories || 0 };
    } catch (error) {
        console.error('Error getting today totals:', error);
        return { steps: 0, distance: 0, calories: 0 };
    }
};

export const getWeeklyTotals = async (userId) => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    try {
        const res = await executeSql(
            `SELECT COALESCE(SUM(steps), 0) as totalSteps,
              COALESCE(SUM(distanceKm), 0) as totalDistance,
              COALESCE(SUM(caloriesKcal), 0) as totalCalories
             FROM ActivitySummary WHERE userId = ? AND recordedDate >= ? AND recordedDate <= ?`,
            [userId, startStr, endStr]
        );
        const result = res.rows.item(0);
        console.log('Weekly totals:', result);
        return { steps: result.totalSteps || 0, distance: result.totalDistance || 0, calories: result.totalCalories || 0 };
    } catch (error) {
        console.error('Error getting weekly totals:', error);
        return { steps: 0, distance: 0, calories: 0 };
    }
};

export const getMonthlyTotals = async (userId) => {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 29);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    try {
        const res = await executeSql(
            `SELECT COALESCE(SUM(steps), 0) as totalSteps,
              COALESCE(SUM(distanceKm), 0) as totalDistance,
              COALESCE(SUM(caloriesKcal), 0) as totalCalories
             FROM ActivitySummary WHERE userId = ? AND recordedDate >= ? AND recordedDate <= ?`,
            [userId, startStr, endStr]
        );
        const result = res.rows.item(0);
        console.log('Monthly totals:', result);
        return { steps: result.totalSteps || 0, distance: result.totalDistance || 0, calories: result.totalCalories || 0 };
    } catch (error) {
        console.error('Error getting monthly totals:', error);
        return { steps: 0, distance: 0, calories: 0 };
    }
};

export const getAllPeriodTotals = async (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const weekEnd = new Date();
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    const monthEnd = new Date();
    const monthStart = new Date(monthEnd);
    monthStart.setDate(monthStart.getDate() - 29);

    try {
        const todayRes = await executeSql(
            `SELECT COALESCE(SUM(steps), 0) as totalSteps,
              COALESCE(SUM(distanceKm), 0) as totalDistance,
              COALESCE(SUM(caloriesKcal), 0) as totalCalories
             FROM ActivitySummary WHERE userId = ? AND recordedDate = ?`,
            [userId, today]
        );

        const weekRes = await executeSql(
            `SELECT COALESCE(SUM(steps), 0) as totalSteps,
              COALESCE(SUM(distanceKm), 0) as totalDistance,
              COALESCE(SUM(caloriesKcal), 0) as totalCalories
             FROM ActivitySummary WHERE userId = ? AND recordedDate >= ? AND recordedDate <= ?`,
            [userId, weekStart.toISOString().split('T')[0], today]
        );

        const monthRes = await executeSql(
            `SELECT COALESCE(SUM(steps), 0) as totalSteps,
              COALESCE(SUM(distanceKm), 0) as totalDistance,
              COALESCE(SUM(caloriesKcal), 0) as totalCalories
             FROM ActivitySummary WHERE userId = ? AND recordedDate >= ? AND recordedDate <= ?`,
            [userId, monthStart.toISOString().split('T')[0], today]
        );

        const todayData = todayRes.rows.item(0);
        const weekData = weekRes.rows.item(0);
        const monthData = monthRes.rows.item(0);

        return {
            today: { steps: todayData.totalSteps || 0, distance: todayData.totalDistance || 0, calories: todayData.totalCalories || 0 },
            week: { steps: weekData.totalSteps || 0, distance: weekData.totalDistance || 0, calories: weekData.totalCalories || 0 },
            month: { steps: monthData.totalSteps || 0, distance: monthData.totalDistance || 0, calories: monthData.totalCalories || 0 }
        };
    } catch (error) {
        console.error('Error getting all period totals:', error);
        return {
            today: { steps: 0, distance: 0, calories: 0 },
            week: { steps: 0, distance: 0, calories: 0 },
            month: { steps: 0, distance: 0, calories: 0 }
        };
    }
};

export const getLast6HoursActivity = async (userId) => {
    const now = new Date();
    const currentHour = now.getHours();
    const today = now.toISOString().split('T')[0];
    const hoursNeeded = 6;
    const startHour = currentHour - (hoursNeeded - 1);

    try {
        if (startHour >= 0) {
            const res = await executeSql(
                `SELECT hour, steps, calories FROM HourlyActivity
                 WHERE userId = ? AND recordedDate = ? AND hour >= ? AND hour <= ?
                 ORDER BY hour ASC`,
                [userId, today, startHour, currentHour]
            );

            const rows = rowsToArray(res);
            const last6Hours = [];
            for (let i = 0; i < hoursNeeded; i++) {
                const hour = startHour + i;
                const found = rows.find(r => r.hour === hour);
                last6Hours.push({ hour, steps: found?.steps || 0, calories: found?.calories || 0, date: today });
            }
            return last6Hours;
        } else {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            const yesterdayStartHour = 24 + startHour;

            const res = await executeSql(
                `SELECT hour, steps, calories, recordedDate FROM HourlyActivity
                 WHERE userId = ?
                   AND ((recordedDate = ? AND hour >= ?) OR (recordedDate = ? AND hour <= ?))
                 ORDER BY recordedDate ASC, hour ASC`,
                [userId, yesterdayStr, yesterdayStartHour, today, currentHour]
            );

            const rows = rowsToArray(res);
            const last6Hours = [];

            for (let i = yesterdayStartHour; i < 24; i++) {
                const found = rows.find(r => r.hour === i && r.recordedDate === yesterdayStr);
                last6Hours.push({ hour: i, steps: found?.steps || 0, calories: found?.calories || 0, date: yesterdayStr });
            }
            for (let i = 0; i <= currentHour; i++) {
                const found = rows.find(r => r.hour === i && r.recordedDate === today);
                last6Hours.push({ hour: i, steps: found?.steps || 0, calories: found?.calories || 0, date: today });
            }
            return last6Hours.slice(-hoursNeeded);
        }
    } catch (error) {
        console.error('Error getting last 6 hours activity:', error);
        return [];
    }
};

export const getLast6HoursForChart = async (userId) => {
    const last6Hours = await getLast6HoursActivity(userId);
    const formatHour = (hour) => {
        if (hour === 0) return '12AM';
        if (hour < 12) return `${hour}AM`;
        if (hour === 12) return '12PM';
        return `${hour - 12}PM`;
    };
    return {
        labels: last6Hours.map(d => formatHour(d.hour)),
        steps: last6Hours.map(d => d.steps),
        calories: last6Hours.map(d => d.calories)
    };
};

export const getHourlyActivityTimeline = async (userId) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    try {
        const res = await executeSql(
            `SELECT hour, steps, calories FROM HourlyActivity
             WHERE userId = ? AND recordedDate = ? ORDER BY hour ASC`,
            [userId, today]
        );

        const rows = rowsToArray(res);

        const timeline = Array(24).fill(null).map((_, hour) => {
            const found = rows.find(r => r.hour === hour);
            return { hour, steps: found?.steps || 0, calories: found?.calories || 0, duration: 60 };
        });

        const groupedTimeline = groupActivityBlocks(timeline);
        const totalActiveMinutes = timeline.reduce((sum, item) => sum + (item.steps > 0 ? 60 : 0), 0);

        return {
            timeline: groupedTimeline,
            totalDuration: { hours: Math.floor(totalActiveMinutes / 60), minutes: totalActiveMinutes % 60 }
        };
    } catch (error) {
        console.error('Error getting activity timeline:', error);
        return { timeline: [], totalDuration: { hours: 0, minutes: 0 } };
    }
};

const groupActivityBlocks = (timeline) => {
    if (timeline.length === 0) return [];

    const grouped = [];
    let currentGroup = {
        startHour: timeline[0].hour,
        steps: timeline[0].steps,
        calories: timeline[0].calories,
        duration: 60
    };

    const getActivityLevel = (steps) => {
        if (steps === 0) return 0;
        if (steps < 500) return 1;
        if (steps < 1000) return 2;
        return 3;
    };

    for (let i = 1; i < timeline.length; i++) {
        if (getActivityLevel(timeline[i].steps) === getActivityLevel(currentGroup.steps)) {
            currentGroup.duration += 60;
            currentGroup.steps += timeline[i].steps;
            currentGroup.calories += timeline[i].calories;
        } else {
            grouped.push(currentGroup);
            currentGroup = {
                startHour: timeline[i].hour,
                steps: timeline[i].steps,
                calories: timeline[i].calories,
                duration: 60
            };
        }
    }
    grouped.push(currentGroup);
    return grouped;
};

export const getActivityTimeRange = async (userId, startHour, endHour) => {
    const today = new Date().toISOString().split('T')[0];
    try {
        const res = await executeSql(
            `SELECT hour, steps, calories FROM HourlyActivity
             WHERE userId = ? AND recordedDate = ? AND hour BETWEEN ? AND ?
             ORDER BY hour ASC`,
            [userId, today, startHour, endHour]
        );
        return rowsToArray(res);
    } catch (error) {
        console.error('Error getting time range activity:', error);
        return [];
    }
};

export const getBloodPressureData = async (userId, days = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateString = startDate.toISOString().split('T')[0];

    const result = await executeSql(
        `SELECT recordedDate, systolic, diastolic, recordedAt
         FROM HealthVitals WHERE userId = ? AND recordedDate >= ?
         ORDER BY recordedAt ASC`,
        [userId, startDateString]
    );

    return rowsToArray(result);
};

export const getWeeklyBloodPressure = async (userId) => {
    console.log("Fetching weekly blood pressure for userId:", userId);
    const { start, end } = getLastWeekRange();

    const res = await executeSql(
        `SELECT recordedDate, systolic, diastolic FROM HealthVitals
         WHERE userId = ? AND recordedDate >= ? AND recordedDate <= ?
         ORDER BY recordedDate`,
        [userId, start, end]
    );

    const rows = rowsToArray(res);
    console.log("Weekly blood pressure rows fetched:", rows);

    const dateMap = {};
    rows.forEach(r => { dateMap[r.recordedDate] = { systolic: r.systolic || 0, diastolic: r.diastolic || 0 }; });

    const labels = [], systolicData = [], diastolicData = [];
    const startDate = new Date(start);

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        labels.push(currentDate.toLocaleDateString('en-US', { weekday: 'short' }));
        const dayData = dateMap[dateStr];
        systolicData.push(dayData ? dayData.systolic : 0);
        diastolicData.push(dayData ? dayData.diastolic : 0);
    }

    return {
        labels,
        datasets: [
            { data: systolicData, color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`, strokeWidth: 2 },
            { data: diastolicData, color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`, strokeWidth: 2 }
        ]
    };
};

export const getWeeklySpO2 = async (userId) => {
    console.log("Fetching weekly SpO2 for userId:", userId);
    const { start, end } = getLastWeekRange();

    const res = await executeSql(
        `SELECT recordedDate, spO2 FROM HealthVitals
         WHERE userId = ? AND recordedDate >= ? AND recordedDate <= ?
         ORDER BY recordedDate`,
        [userId, start, end]
    );

    const rows = rowsToArray(res);
    console.log("Weekly SpO2 rows fetched:", rows);

    const dateMap = {};
    rows.forEach(r => { dateMap[r.recordedDate] = r.spO2 || 0; });

    const labels = [], data = [];
    const startDate = new Date(start);

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        labels.push(currentDate.toLocaleDateString('en-US', { weekday: 'short' }));
        data.push(dateMap[dateStr] || 0);
    }

    return { labels, datasets: [{ data, strokeWidth: 2 }] };
};

export const getWeeklyHeartRate = async (userId) => {
    console.log("Fetching weekly heart rate for userId:", userId);
    const { start, end } = getLastWeekRange();

    const res = await executeSql(
        `SELECT recordedDate, bpm FROM HealthVitals
         WHERE userId = ? AND recordedDate >= ? AND recordedDate <= ?
         ORDER BY recordedDate`,
        [userId, start, end]
    );

    const rows = rowsToArray(res);
    console.log("Weekly heart rate rows fetched:", rows);

    const dateMap = {};
    rows.forEach(r => { dateMap[r.recordedDate] = r.bpm || 0; });

    const labels = [], data = [];
    const startDate = new Date(start);

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        labels.push(currentDate.toLocaleDateString('en-US', { weekday: 'short' }));
        data.push(dateMap[dateStr] || 0);
    }

    return { labels, datasets: [{ data, strokeWidth: 2 }] };
};