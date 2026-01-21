/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Button, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Scan from './src/components/Scan';
import { FitCloudContext, FitCloudProvider } from "./src/components/FitCloudContext";
import Navigation from "./src/navigation"
import SearchDeviceScreen from './src/Screens/SearchDeviceScreen';
import { useContext, useEffect, useState } from 'react';
import { getStepData } from './src/components/FitCloudSteps';
import { createTables } from './src/db/schema';
import UserDao, { clear, getAllUsers, getUser, getUserById, insert } from './src/db/Dao/UserDao';
import DeviceInfo from 'react-native-device-info';
import BackgroundFetch from 'react-native-background-fetch';


// Headless task for Android
const BackgroundFetchHeadlessTask = async (event) => {
  const taskId = event.taskId;
  const isTimeout = event.timeout;

  if (isTimeout) {
    console.log('[BackgroundFetch] Headless TIMEOUT:', taskId);
    BackgroundFetch.finish(taskId);
    return;
  }

  console.log('[BackgroundFetch] Headless event:', taskId);

  try {
    // Get stored userId (you need to store this in AsyncStorage or similar)
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userId = await AsyncStorage.getItem('userId');

    if (userId) {
      // Get steps and calories from health data
      // You'll need to implement these functions based on your health data source
      const steps = await getStepsFromHealthKit(); // Implement this
      const calories = await getCaloriesFromHealthKit(); // Implement this

      await insertHourlyActivity(userId, steps, calories);
      console.log('[BackgroundFetch] Headless data saved');
    }
  } catch (error) {
    console.error('[BackgroundFetch] Headless error:', error);
  }

  BackgroundFetch.finish(taskId);
};

// Register headless task
BackgroundFetch.registerHeadlessTask(BackgroundFetchHeadlessTask);

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <FitCloudProvider>
        <AppContent />
      </FitCloudProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const { api, devices, setDevices, isWatchReady, user } = useContext(FitCloudContext);
  const [initial, setInitial] = useState('');

  useEffect(() => {

    // if (isWatchReady) {
    (async () => {
      createTables().catch(error => {
        console.error('Error creating tables:', error);
      }).then(async () => {
        const users = await getAllUsers();
        console.log("User from DB:", users);
        let user = users[0];
        console.log("User from DB:", user);
        if (api && user?.userId) {
          api.isUserAlreadyBound(user?.userId, (data) => {
            console.log("User bound status:", data);
            if (data) { setInitial('App') } else { setInitial('Auth') }
          });
          // getStepData();
          api.watchIsConnected()
          api.boundUserData()
        }
        else {
          setInitial('Auth')
        }
      });
    })();
    // }

  }, []);

  return (


    <SafeAreaView style={styles.container}>
      {initial !== '' && <Navigation initial={initial} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#049CDB',
  },
});

export default App;
