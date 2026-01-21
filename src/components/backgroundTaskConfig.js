// backgroundTaskConfig.js
import BackgroundFetch from 'react-native-background-fetch';
import { insertHourlyActivity } from '../db/Dao/StepDao';

// Initialize background fetch
export const initBackgroundFetch = async (userId, currentSteps, currentCalories) => {
    const onEvent = async (taskId) => {
        console.log('[BackgroundFetch] Event received:', taskId);

        try {
            // Get current steps and calories
            // const currentSteps = await getStepsCallback();
            // const currentCalories = await getCaloriesCallback();

            // Save to database
            await insertHourlyActivity(userId, currentSteps, currentCalories);

            console.log(`[BackgroundFetch] Saved: ${currentSteps} steps, ${currentCalories} cal`);
        } catch (error) {
            console.error('[BackgroundFetch] Error:', error);
        }

        // Required: Signal completion
        BackgroundFetch.finish(taskId);
    };

    const onTimeout = async (taskId) => {
        console.warn('[BackgroundFetch] TIMEOUT:', taskId);
        BackgroundFetch.finish(taskId);
    };

    // Configure background fetch
    const status = await BackgroundFetch.configure(
        {
            minimumFetchInterval: 60, // Fetch every 60 minutes (hourly)
            stopOnTerminate: false,    // Continue after app termination
            startOnBoot: true,         // Start on device boot
            enableHeadless: true,      // Enable headless mode
            requiresBatteryNotLow: false,
            requiresCharging: false,
            requiresDeviceIdle: false,
            requiresStorageNotLow: false,
        },
        onEvent,
        onTimeout
    );

    console.log('[BackgroundFetch] Status:', status);
};

// Stop background fetch
export const stopBackgroundFetch = async () => {
    await BackgroundFetch.stop();
    console.log('[BackgroundFetch] Stopped');
};

// Check background fetch status
export const getBackgroundFetchStatus = async () => {
    const status = await BackgroundFetch.status();
    console.log('[BackgroundFetch] Status:', status);
    return status;
};