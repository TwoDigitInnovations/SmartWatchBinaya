import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Platform,
    PermissionsAndroid,
    Animated,
    Easing,
    StatusBar,
    Alert,
    Modal,
    Linking,
} from 'react-native';

import { FitCloudContext } from "../components/FitCloudContext";
import { Search, Bluetooth, ChevronRight, Check } from 'lucide-react-native';
import { BlurView } from '@react-native-community/blur';
import { reset } from '../../navigationRef';
import LinearGradient from 'react-native-linear-gradient';
import { createTables } from '../db/schema';
import { useBluetoothState } from '../utils/bluetoothState';



const SearchDeviceScreen = (props) => {


    const [scanning, setScanning] = useState(false);
    const spin = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(1)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const connectProgress = useRef(new Animated.Value(0)).current;
    const transferAnim = useRef(new Animated.Value(0)).current;
    // const [connectingDevice, setConnectingDevice] = useState(null);
    const [connectSuccess, setConnectSuccess] = useState(false);
    const { api, devices, setDevices, connectingDevice, setConnectingDevice } = useContext(FitCloudContext);
    const bluetoothState = useBluetoothState();
    const [showModal, setShowModal] = useState(false);

    console.log(bluetoothState)
    useEffect(() => {
        createTables().catch(error => {
            console.error('Error creating tables:', error);
        });

    }, [])




    useEffect(() => {
        if (!connectingDevice) {
            setConnectSuccess(true);
            // reset('App');
        };
    }, [connectingDevice])


    const startScan = async () => {
        if (bluetoothState !== "PoweredOn") {
            setShowModal(true);
            return;
        }
        setDevices([])
        await requestPermissions();
        setScanning(true);
        api.startScan();
    }
    const requestPermissions = async () => {
        if (Platform.OS === "android") {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            ]);
        }
    };

    const stopScan = async () => {
        setScanning(false);
        api.stopScan();
    };

    const pressIn = () => {
        Animated.spring(buttonScale, { toValue: 0.97, useNativeDriver: true }).start();
    };
    const pressOut = () => {
        Animated.spring(buttonScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    };

    const startConnectAnimation = (device) => {
        setConnectingDevice(device);
        setConnectSuccess(false);
        connectProgress.setValue(0);
        Animated.timing(connectProgress, {
            toValue: 1,
            duration: 1500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                try {
                    api.connect(device.uuid);
                } catch (err) {
                    console.log('Connection error:', err);
                }
                setConnectSuccess(true);

            }
        });
    };

    const connect = (device) => {
        api.connect(device.uuid);
        stopScan();
        startConnectAnimation(device);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.cardOuter}
            activeOpacity={0.9}
            onPress={() => connect(item)}
        >
            <View style={styles.cardInner}>
                <BlurView style={styles.cardBlur} blurType="light" blurAmount={18} reducedTransparencyFallbackColor="rgba(255,255,255,0.6)" />
                <View style={styles.cardRow}>
                    <View style={styles.iconCircle}>
                        <Bluetooth size={22} color="#007AFF" />
                    </View>
                    <View style={styles.details}>
                        <Text style={styles.name}>{item.name || 'Unknown Device'}</Text>
                        <Text style={styles.mac} numberOfLines={1} ellipsizeMode="middle">{item.uuid}</Text>
                    </View>
                    <View style={styles.rightColumn}>
                        <View style={styles.rssiBadge}>
                            <Text style={styles.rssiText}>{item.rssi ?? '--'}</Text>
                        </View>
                        <ChevronRight size={18} color="#999" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    useEffect(() => {
        let spinLoop;
        let pulseLoop;
        if (scanning) {
            spin.setValue(0);
            pulse.setValue(1);
            spinLoop = Animated.loop(
                Animated.timing(spin, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            pulseLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulse, { toValue: 1.35, duration: 700, useNativeDriver: true }),
                    Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
                ])
            );
            spinLoop.start();
            pulseLoop.start();
        } else {
            spin.setValue(0);
            pulse.setValue(1);
        }
        return () => {
            if (spinLoop) spinLoop.stop();
            if (pulseLoop) pulseLoop.stop();
        };
    }, [scanning]);

    // transfer animation loop while connecting
    useEffect(() => {
        let transferLoop;
        if (connectingDevice) {
            transferAnim.setValue(0);
            transferLoop = Animated.loop(
                Animated.timing(transferAnim, {
                    toValue: 1,
                    duration: 900,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            transferLoop.start();
        } else {
            transferAnim.setValue(0);
        }
        return () => {
            if (transferLoop) transferLoop.stop();
        };
    }, [connectingDevice]);

    console.log('comming here')
    // return <Scan />
    return (
        <LinearGradient colors={['#049CDB', '#E0F2FE']} style={styles.safe}>
            {/* <View style={styles.safe}> */}
            <StatusBar barStyle="dark-content" />
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Search Device</Text>
                <Text style={styles.subtitle}>Find nearby devices and connect securely</Text>
            </View>

            {/* animated center search icon */}
            {scanning ? (
                <View style={styles.neuOuter}>
                    <Animated.View
                        style={[
                            styles.neuInner,
                            {
                                transform: [
                                    {
                                        rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }),
                                    },
                                    { scale: pulse },
                                ],
                            },
                        ]}
                    >
                        <BlurView style={styles.topIconBlur} blurType="light" blurAmount={30} reducedTransparencyFallbackColor="rgba(255,255,255,0.12)" />
                        <Search size={60} color="#007AFF" />
                    </Animated.View>
                </View>
            ) : (
                <View style={styles.topIconPlaceholder} />
            )}

            <FlatList
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                data={devices}
                keyExtractor={item => item.uuid || item.mac}
                renderItem={renderItem}
                ListEmptyComponent={
                    !scanning ? (
                        <Text style={styles.empty}>No devices found</Text>
                    ) : (
                        <View style={{ alignItems: 'center', marginTop: 24 }}>
                            <Animated.View style={{ transform: [{ scale: pulse }] }}>
                                <Search size={40} color="#007AFF" />
                            </Animated.View>
                            <Text style={[styles.empty, { marginTop: 12, color: '#007AFF' }]}>Scanning...</Text>
                        </View>
                    )
                }
            />

            <View style={styles.footer}>
                {/* <BlurView style={styles.buttonBlur} blurType="light" blurAmount={18} reducedTransparencyFallbackColor="rgba(255,255,255,0.12)" > */}
                <TouchableOpacity
                    style={[styles.primaryButton, scanning && styles.primaryButtonActive]}
                    onPress={scanning ? stopScan : startScan}
                    activeOpacity={0.9}
                >

                    <Text style={[styles.primaryText, scanning && styles.primaryTextActive]}>{scanning ? 'Stop Scan' : 'Search Device'}</Text>
                </TouchableOpacity>
                {/* </BlurView> */}
                {/* <TouchableOpacity style={styles.ghostButton} onPress={() => api.disconnect()} activeOpacity={0.9}>
                    <BlurView style={styles.buttonBlur} blurType="light" blurAmount={14} reducedTransparencyFallbackColor="rgba(255,255,255,0.08)" />
                    <Text style={styles.ghostText}>Disconnect</Text>
                </TouchableOpacity> */}
            </View>
            {/* Connection overlay */}
            {connectingDevice ? (
                <Animated.View style={[styles.overlay, { opacity: connectProgress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0.85, 1] }) }]} pointerEvents="none">
                    <View style={styles.overlayCenter}>
                        <Animated.View style={[styles.watchCircle, { transform: [{ scale: connectProgress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.9, 1.08, 1] }) }, { rotate: connectProgress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>
                            <BlurView style={styles.watchBlur} blurType="light" blurAmount={20} reducedTransparencyFallbackColor="rgba(255,255,255,0.1)" />
                            {connectSuccess ? <Check size={36} color="#28C76F" /> : <View style={styles.watchInner} />}
                        </Animated.View>
                        <Text style={styles.connectingText}>Connecting to</Text>
                        <Text style={styles.connectingName}>{connectingDevice.name || connectingDevice.uuid}</Text>

                        <View style={styles.transferBarContainer}>
                            <Animated.View
                                style={[
                                    styles.transferBarMoving,
                                    {
                                        transform: [
                                            {
                                                translateX: transferAnim.interpolate({ inputRange: [0, 1], outputRange: [-220, 220] }),
                                            },
                                        ],
                                    },
                                ]}
                            />
                        </View>
                    </View>
                </Animated.View>
            ) : null}

            <Modal
                visible={showModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Bluetooth is not enabled</Text>
                        <Text style={styles.modalMessage}>
                            Please enable Bluetooth to scan for devices.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={() => {
                                    setShowModal(true);
                                    Linking.openSettings();
                                }}
                            >
                                <Text style={styles.confirmButtonText}>Settings </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* </View> */}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        // backgroundColor: 'white',
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111',
    },
    subtitle: {
        fontSize: 13,
        color: '#000',
        marginTop: 6,
    },
    topIconContainer: {
        alignSelf: 'center',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 14,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
        overflow: 'hidden',
    },
    topIconBlur: {
        ...StyleSheet.absoluteFillObject,
    },
    topIconPlaceholder: {
        height: 28,
        marginVertical: 8,
    },
    card: {
        padding: 14,
        borderRadius: 12,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.26)',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
        overflow: 'hidden',
    },
    cardBlur: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 12,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fefefe',
        borderWidth: 1,
        borderColor: 'rgba(0,122,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    details: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
    },
    mac: {
        fontSize: 12,
        color: '#777',
        marginTop: 4,
    },
    rightColumn: {
        alignItems: 'flex-end',
        marginLeft: 8,
    },
    rssiBadge: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    rssiText: {
        fontSize: 12,
        color: '#333',
    },
    empty: {
        textAlign: 'center',
        color: '#000',
        marginTop: 40,
    },
    footer: {
        padding: 16,
        paddingTop: 8,
        backgroundColor: 'transparent',
    },
    primaryButton: {
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#fefefe',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,122,255,0.12)',
        overflow: 'hidden',
    },
    primaryButtonActive: {
        // optional active styles
    },
    primaryText: {
        color: '#007AFF',
        fontWeight: '700',
        fontSize: 16,
    },
    primaryTextActive: {
        // color: '#fff',
    },
    ghostButton: {
        marginTop: 10,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    ghostText: {
        color: '#222',
        fontWeight: '600',
    },
    buttonBlur: {
        ...StyleSheet.absoluteFillObject,
    },
    cardOuter: {
        borderRadius: 14,
        marginBottom: 12,
        shadowColor: '#bfcfe6',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 3,
        backgroundColor: 'transparent',
    },
    cardInner: {
        borderRadius: 12,
        backgroundColor: '#ecf0f3',
        overflow: 'hidden',
        padding: 0,
    },
    neuOuter: {
        alignSelf: 'center',
        width: 132,
        height: 132,
        borderRadius: 66,
        backgroundColor: '#ecf0f3',
        shadowColor: '#bfcfe6',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 6,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginVertical: 14,
    },
    neuInner: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ecf0f3',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ffffff',
        shadowOffset: { width: -6, height: -6 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
    },
    /* connection overlay styles */
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(16,24,40,0.5)'.replace(/16,24,40/, '16,24,40'),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
    },
    overlayCenter: {
        width: '80%',
        alignItems: 'center',
    },
    watchCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    watchBlur: {
        ...StyleSheet.absoluteFillObject,
    },
    watchInner: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#007AFF',
    },
    connectingText: {
        color: '#fff',
        opacity: 0.9,
        marginTop: 6,
        fontSize: 14,
    },
    connectingName: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        marginTop: 6,
        marginBottom: 12,
    },
    transferBarContainer: {
        width: '100%',
        height: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
        marginTop: 12,
    },
    transferBarMoving: {
        width: 140,
        height: '100%',
        backgroundColor: 'rgba(0,122,255,0.92)',
        borderRadius: 8,
        opacity: 0.95,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        marginHorizontal: 30,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    modalMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    confirmButton: {
        backgroundColor: '#049CDB',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});


export default SearchDeviceScreen;