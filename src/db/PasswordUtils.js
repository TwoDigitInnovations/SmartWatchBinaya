import RNSimpleCrypto from 'react-native-simple-crypto';

export const hashPassword = async (password) => {
    return RNSimpleCrypto.SHA.sha256(password);
};
