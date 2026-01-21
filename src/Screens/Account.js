import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { getUserById, updateUser, getUserByUserId, insertUser, getAllUsers } from '../db/Dao/UserDao';
import { FitCloudContext } from '../components/FitCloudContext';
import { useIsFocused } from '@react-navigation/native';
import { calculateAge } from '../assets/Helpers/constant';
import DeviceInfo from 'react-native-device-info';



const Input = ({ label, ...props }) => (
    <View style={styles.group}>
        <Text style={styles.label}>{label}</Text>
        <TextInput style={styles.input} {...props} />
    </View>
);

const Label = ({ text }) => (
    <Text style={styles.label}>{text}</Text>
);

const Account = ({ userId }) => {
    const isFocus = useIsFocused()
    const { api, userDetails, setUserDetails } = useContext(FitCloudContext);
    const [form, setForm] = useState({
        name: '',
        email: '',
        gender: '',
        dob: '',
        height: 170,
        weight: 65,
        avatar: null,
        age: 0,
    });
    const [imgError, setImgError] = useState(false);


    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userDetails) return;
        loadUser();
    }, [isFocus]);

    const loadUser = async () => {
        console.log("Loading user with ID:", userDetails?.userId);
        // const user = await getUserById(userDetails?.userId);


        const d = await getAllUsers();
        let user = d[0]
        console.log("Loaded User:", user);
        console.log(d)
        if (!user) return;
        delete user.id;
        delete user.code;
        delete user.userId;
        setForm(user);
    };

    const updateField = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    /* ---------- Avatar ---------- */
    const pickAvatar = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, res => {
            if (res.didCancel || !res.assets) return;
            setImgError(false);
            updateField('avatar', res.assets[0].uri);
        });
    };

    /* ---------- Validation ---------- */
    const validate = () => {
        if (!form.name.trim()) return 'Name is required';
        if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Invalid email';
        if (!form.gender) return 'Select gender';
        if (!form.dob) return 'Select date of birth';
        if (form.height < 100 || form.height > 250) return 'Invalid height';
        if (form.weight < 30 || form.weight > 200) return 'Invalid weight';
        return null;
    };

    /* ---------- Update ---------- */
    const onUpdate = async () => {
        const error = validate();
        if (error) return Alert.alert('Validation Error', error);

        setLoading(true);
        try {
            await updateUser(userDetails.userId, {
                ...form,
                userId: userDetails.userId

            });
            // api.addUser(
            //     {
            //         age: form.age,
            //         height: form.height,
            //         weight: form.weight,
            //         gender: form.gender === 'MALE' ? 1 : 0,
            //         userId: userDetails.userId
            //     }
            // );
            Alert.alert('Success', 'Profile updated successfully');
        } catch (err) {
            console.log(err)
            Alert.alert('Error', 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>

            {/* Avatar */}
            <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar}>
                <Image
                    source={!form?.avatar?.includes('../') ? { uri: form.avatar } : require('../assets/images/avatar.png')}
                    style={styles.avatar}
                    onError={() => setImgError(true)}
                />
                <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>

            <Input label="Full Name" value={form.name} onChangeText={v => updateField('name', v)} />
            <Input label="E-Mail" value={form.email} keyboardType="email-address" onChangeText={v => updateField('email', v)} />

            {/* Gender */}
            <Label text="Gender" />
            <Picker
                selectedValue={form.gender}
                onValueChange={v => updateField('gender', v)}
                style={styles.picker}
                itemStyle={{ color: '#000', fontSize: 16 }}
            >
                <Picker.Item style={{ color: '#000' }} label="Select Gender" value="" />
                <Picker.Item style={{ color: '#000' }} label="Male" value="MALE" />
                <Picker.Item style={{ color: '#000' }} label="Female" value="FEMALE" />
                <Picker.Item style={{ color: '#000' }} label="Other" value="OTHER" />
            </Picker>

            {/* DOB */}
            <Label text="Date of Birth" />
            <TouchableOpacity style={styles.dateBox} onPress={() => setShowDatePicker(true)}>
                <Text>{form.dob || 'Select Date'}</Text>
            </TouchableOpacity>

            <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                maximumDate={new Date()}
                onConfirm={d => {
                    updateField('dob', d.toISOString().split('T')[0]);
                    const e = calculateAge(d.toISOString().split('T')[0]);
                    updateField('age', e)
                    console.log(e)
                    setShowDatePicker(false);
                }}
                onCancel={() => setShowDatePicker(false)}
            />

            {/* Height */}
            <Label text={`Height: ${form.height} cm`} />
            <Picker
                selectedValue={form.height}
                onValueChange={v => updateField('height', v)}
                style={styles.picker}
                itemStyle={{ color: '#000', fontSize: 16 }}
            >
                {Array.from({ length: 101 }, (_, i) => 120 + i).map(v => (
                    <Picker.Item style={{ color: '#000' }} key={v} label={`${v} cm`} value={v} />
                ))}
            </Picker>

            {/* Weight */}
            <Label text={`Weight: ${form.weight} kg`} />
            <Picker
                selectedValue={form.weight}
                onValueChange={v => updateField('weight', v)}
                style={styles.picker}
                itemStyle={{ color: '#000', fontSize: 16 }}
            >
                {Array.from({ length: 121 }, (_, i) => 30 + i).map(v => (
                    <Picker.Item style={{ color: '#000' }} key={v} label={`${v} kg`} value={v} />
                ))}
            </Picker>

            <TouchableOpacity style={styles.button} onPress={onUpdate} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update'}</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff' },

    avatarWrap: { alignItems: 'center', marginBottom: 20 },
    avatar: { width: 90, height: 90, borderRadius: 45 },
    editText: { marginTop: 6, color: '#0AA5D8' },

    group: { marginBottom: 14 },
    label: { fontSize: 14, marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderColor: '#1EA7FD',
        borderRadius: 10,
        padding: 12,
    },

    picker: {
        borderWidth: 1,
        borderColor: '#1EA7FD',
        borderRadius: 10,
        marginBottom: 14,
    },

    dateBox: {
        borderWidth: 1,
        borderColor: '#1EA7FD',
        borderRadius: 10,
        padding: 14,
        marginBottom: 14,
    },

    button: {
        backgroundColor: '#0AA5D8',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 100,
    },

    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',

    },

});


export default Account;
