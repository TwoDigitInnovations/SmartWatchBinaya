import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import { SquarePlus, LayoutDashboard, MonitorSmartphone, User } from 'lucide-react-native';
import Constants, { FONTS } from '../assets/Helpers/constant';

import HomeScreen from '../Screens/Home';
import Calories from '../Screens/Calories';
import FindDevice from '../Screens/FindDevice';
import Account from '../Screens/Account';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
  </Stack.Navigator>
);

const CaloriesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Calories" component={Calories} />

  </Stack.Navigator>
);

const DeviceStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FindDevice" component={FindDevice} />
  </Stack.Navigator>
);

const AccountStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Profile" component={Account} />

  </Stack.Navigator>
);

export const TabNav = () => {

  const TabArr = [
    {
      icon: LayoutDashboard,
      component: HomeStack,
      routeName: 'Home',
      name: 'Home',
    },
    {
      icon: SquarePlus,
      component: CaloriesStack,
      routeName: 'Calories',
      name: 'Calories',
    },
    {
      icon: MonitorSmartphone,
      component: DeviceStack,
      routeName: 'Device',
      name: 'Device',
    },
    {
      icon: User,
      component: AccountStack,
      routeName: 'Account',
      name: 'Account',
    },
  ];

  const TabButton = ({ onPress, onclick, item, index }) => {
    const isFocused = useIsFocused();

    const IconComponent = item.icon;

    return (
      <View style={styles.tabBtnView}>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={onclick ? onclick : onPress}
            activeOpacity={0.7}
            style={[
              styles.tabBtn,
              isFocused && styles.tabBtnActive,
            ]}>
            <IconComponent
              color={isFocused ? '#049CDB' : Constants.customgrey3}
              size={30}
              strokeWidth={isFocused ? 2.5 : 2}
            />
          </TouchableOpacity>

        </View>
        {/* <Text
          style={[
            styles.tabtxt,
            { color: isFocused ? Constants.white : Constants.customgrey3 },
          ]}>
          {item.name}
        </Text> */}
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          width: '100%',
          // minHeight: Platform?.OS === 'android' ? 95 : 60,
          backgroundColor: '#049CDB',
          // borderTopRightRadius: 15,
          // borderTopLeftRadius: 15,
          borderTopWidth: 0,
          paddingTop: 30,
        },
      }}>
      {TabArr.map((item, index) => {
        return (
          <Tab.Screen
            key={index}
            name={item.routeName}
            component={item.component}
            options={{
              tabBarShowLabel: false,
              tabBarButton: props => (
                <TabButton {...props} item={item} index={index} />
              ),
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBtnView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  iconContainer: {
    position: 'relative',
  },
  tabBtn: {
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tabtxt: {
    color: Constants.black,
    fontFamily: FONTS.Medium,
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Constants.green,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});