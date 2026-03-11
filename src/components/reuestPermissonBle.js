import { PermissionsAndroid, Platform } from 'react-native';

export const requestBlePermissions = async () => {
    if (Platform.OS !== 'android') return true;

    const apiLevel = Platform.Version;

    if (apiLevel >= 31) {
        // Android 12+
        const results = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return Object.values(results).every(
            r => r === PermissionsAndroid.RESULTS.GRANTED
        );
    } else {
        // Android 10/11
        const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
    }
};