import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Battery, Bluetooth, Wifi, Smartphone, AlertTriangle, CheckCircle, X } from 'lucide-react-native';

const DetailCard = ({ title, value, icon: Icon, color = "#0374FF" }) => (
    <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={styles.detailCard}
    >
        <View style={styles.cardIcon}>
            <Icon size={24} color={color} />
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardValue}>{value}</Text>
        </View>
    </LinearGradient>
);

const ConnectedWatchDetail = ({ navigation }) => {
    const [isUnbinding, setIsUnbinding] = useState(false);
    const [showUnbindModal, setShowUnbindModal] = useState(false);

    // Mock data - replace with actual data from context or props
    const watchData = {
        name: "FitCloud Pro",
        model: "FC-2024",
        battery: 85,
        isConnected: true,
        firmwareVersion: "1.2.3",
        lastSync: "2025-12-19 14:30",
        macAddress: "AA:BB:CC:DD:EE:FF",
    };

    const handleUnbind = () => {
        setShowUnbindModal(true);
    };

    const confirmUnbind = () => {
        setIsUnbinding(true);
        setShowUnbindModal(false);
        // Simulate unbinding process
        setTimeout(() => {
            setIsUnbinding(false);
            Alert.alert("Success", "Watch has been unbound successfully.");
            navigation.goBack();
        }, 2000);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <LinearGradient colors={['#049CDB', '#E0F2FE']} style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <X size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Watch Details</Text>
                <View style={styles.headerRight} />
            </LinearGradient>

            {/* Watch Display */}
            <View style={styles.watchContainer}>
                <LinearGradient
                    colors={['#1a1a2e', '#16213e', '#0f3460']}
                    style={styles.watchGradient}
                >
                    <View style={styles.watchFace}>
                        <View style={styles.watchScreen}>
                            <Text style={styles.watchTime}>14:30</Text>
                            <Text style={styles.watchDate}>Dec 19</Text>
                        </View>
                        <View style={styles.watchButtons}>
                            <View style={styles.watchButton} />
                            <View style={styles.watchButton} />
                        </View>
                    </View>
                </LinearGradient>
                <Text style={styles.watchName}>{watchData.name}</Text>
                <Text style={styles.watchModel}>{watchData.model}</Text>
            </View>

            {/* Status Indicator */}
            <View style={styles.statusContainer}>
                <View style={[styles.statusIndicator, watchData.isConnected ? styles.connected : styles.disconnected]}>
                    {watchData.isConnected ? (
                        <CheckCircle size={16} color="#fff" />
                    ) : (
                        <AlertTriangle size={16} color="#fff" />
                    )}
                </View>
                <Text style={styles.statusText}>
                    {watchData.isConnected ? "Connected" : "Disconnected"}
                </Text>
            </View>

            {/* Details Cards */}
            <View style={styles.detailsContainer}>
                <DetailCard
                    title="Battery"
                    value={`${watchData.battery}%`}
                    icon={Battery}
                    color="#5DE542"
                />
                <DetailCard
                    title="Connection"
                    value={watchData.isConnected ? "Bluetooth" : "None"}
                    icon={Bluetooth}
                    color="#0374FF"
                />
                <DetailCard
                    title="Firmware"
                    value={watchData.firmwareVersion}
                    icon={Wifi}
                    color="#FFA400"
                />
                <DetailCard
                    title="Last Sync"
                    value={watchData.lastSync}
                    icon={Smartphone}
                    color="#FF0000"
                />
            </View>

            {/* Unbind Button */}
            <TouchableOpacity
                style={styles.unbindButton}
                onPress={handleUnbind}
                disabled={isUnbinding}
            >
                <LinearGradient
                    colors={['#FF6B6B', '#EE5A52']}
                    style={styles.unbindGradient}
                >
                    <Text style={styles.unbindText}>
                        {isUnbinding ? "Unbinding..." : "Unbind Watch"}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>

            {/* Unbind Confirmation Modal */}
            <Modal
                visible={showUnbindModal}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Unbind Watch</Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to unbind this watch? This will disconnect it from your account and remove all associated data.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowUnbindModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={confirmUnbind}
                            >
                                <Text style={styles.confirmButtonText}>Unbind</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerRight: {
        width: 40,
    },
    watchContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    watchGradient: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    watchFace: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    watchScreen: {
        alignItems: 'center',
    },
    watchTime: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#00ff88',
    },
    watchDate: {
        fontSize: 14,
        color: '#00ff88',
        marginTop: 5,
    },
    watchButtons: {
        position: 'absolute',
        right: -10,
        top: '50%',
        transform: [{ translateY: -20 }],
    },
    watchButton: {
        width: 6,
        height: 20,
        backgroundColor: '#666',
        borderRadius: 3,
        marginVertical: 5,
    },
    watchName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
    },
    watchModel: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    statusIndicator: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    connected: {
        backgroundColor: '#5DE542',
    },
    disconnected: {
        backgroundColor: '#FF6B6B',
    },
    statusText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    detailsContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    detailCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        marginVertical: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    cardIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    unbindButton: {
        marginHorizontal: 20,
        marginBottom: 40,
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    unbindGradient: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    unbindText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
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
        backgroundColor: '#FF6B6B',
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

export default ConnectedWatchDetail;