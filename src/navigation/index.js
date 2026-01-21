import React from 'react';

import { navigationRef } from '../../navigationRef';

import SearchDeviceScreen from '../Screens/SearchDeviceScreen';
import { TabNav } from './TabScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const AuthNavigate = () => {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="SearchDevice" component={SearchDeviceScreen} />
        </AuthStack.Navigator>
    );
};

export default function Navigation(props) {
    console.log(props);
    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={props.initial}
            >
                <Stack.Screen name="Auth" component={AuthNavigate} />
                <Stack.Screen name="App" component={TabNav} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}