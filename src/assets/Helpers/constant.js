// const prodUrl = 'http://192.168.1.3:8000/v1/api/';
// const prodUrl = 'http://192.168.0.106:8000/v1/api/';
const prodUrl = 'https://api.bachhoahouston.com/v1/api/';

let apiUrl = prodUrl;
export const Googlekey = 'AIzaSyCPpmAHIqh2WVs3nN9c3op0J2vq9qgRaJs';
export const Currency = '$';

const Constants = {
  baseUrl: apiUrl,
  lightgrey: '#757575',
  grey: '#979797',
  greennew: '#2E7D32',
  lightgreen: '#E8F5E9',
  yellow: '#5CB446',
  custom_black: '#06161C',
  lightgreen: "#E8F5E9",
  dark_black: '#000000',
  light_black: '#98A2B3',
  black: '#000000',
  saffron: '#F38122',
  pink: '#5CB446',
  lightpink: '#F3812280',
  linearcolor: '#5CB446',
  tabgrey: '#f6f6f6',
  custom_green: '#01B763',
  green: '#07A404',
  white: '#FFFFFF',
  dark_white: '#FFFFFF',
  customblue: '#2048BD',
  deepblue: '#021841',
  darkblue: '#08244C',
  lightblue: '#3AA2BC',
  tabblue: '#E1F4FF',
  // eslint-disable-next-line no-dupe-keys
  lightgrey: '#f2f2f2',
  customgrey: '#858080',
  customgrey2: '#A4A4A4',
  customgrey3: '#DEDEDE',
  customgrey4: '#F1F1F1',
  // red: '#FE7237',
  red: '#FF0000',
  blue: '#7493FF',
  // blue: '#122979',
  // lightblue: '#0D34BF',
  lightred: '#167DD8',
  // Font weights for reference
  font100: 'Poppins-Thin',
  font200: 'Poppins-ExtraLight',
  font300: 'Poppins-Light',
  font400: 'Poppins-Regular',
  font500: 'Montserrat-Medium',
  font600: 'Montserrat-Semibold',
  font700: 'Montserrat-Bold',
  font800: 'Montserrat-ExtraBold',
  font900: 'Montserrat-Black',
  constant_appLaunched: 'appLaunched',
  HAS_ACCOUNT: 'HASACCOUNT',
  LANGUAGE_SELECTED: 'LANGUAGE_SELECTED',
  header_back_middle_right: 'header_back_middle_right',
  header_back: 'header_back',
  keyUserToken: 'token',
  isOnboarded: 'isOnboarded',
  authToken: '',
  keysocailLoggedIn: 'isSocialLoggedIn',
  isProfileCreated: 'isProfileCreated',
  userInfoObj: 'userInfoObj',
  lastUserType: 'lastUserType',
  isDeviceRegistered: 'isDeviceRegistered',
  canResetPass: 'canResetPass',
  fcmToken: 'fcmToken',
  productionUrl: prodUrl,
  // developmentUrl: devUrl,

  emailValidationRegx:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  numberValidationRegx: /^\d+$/,
  passwordValidation: /^(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/,
};
export const FONTS = {
  Black: 'Poppins-Black',
  Bold: 'Poppins-Bold',
  SemiBold: 'Poppins-SemiBold',
  Medium: 'Poppins-Medium',
  Regular: 'Poppins-Regular',
  Light: 'Poppins-Light',
  Thin: 'Poppins-Thin'
};

export const getToday = () =>
  new Date().toISOString().split('T')[0];

export const getWeekStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
};

export const getMonthStart = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0];
};

export const getLastWeekRange = () => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setDate(start.getDate() - 6); // 6 days ago (7 days total including today)

  return {
    start: start.toISOString().split('T')[0], // YYYY-MM-DD
    end: end.toISOString().split('T')[0]      // YYYY-MM-DD
  };
};

export const getLastMonthRange = () => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 29); // 30 days total including today

  return {
    start: start.toISOString().split('T')[0], // YYYY-MM-DD
    end: end.toISOString().split('T')[0]      // YYYY-MM-DD
  };
};


export function calculateAge(birthdate) {
  const today = new Date();
  const birth = new Date(birthdate);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // If birthday hasn't occurred this year yet, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}



export default Constants;
