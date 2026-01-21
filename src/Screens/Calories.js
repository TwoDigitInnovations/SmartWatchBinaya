import React, { useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
} from 'react-native';
import { FitCloudContext } from '../components/FitCloudContext';

const { width } = Dimensions.get('window');

const Calories = () => {
    const { api, userDetails, setUserDetails } = useContext(FitCloudContext);
    const metrics = [
        {
            icon: '❤️',
            title: 'Heart Rate',
            subtitle: 'Resting',
            value: `${userDetails?.healthVitals?.bpm || 'N/A'} BPM`,
            bgColor: '#BAE6FD',
        },
        // {
        //     icon: '🌙',
        //     title: 'Sleep',
        //     subtitle: 'Last Night',
        //     value: `${userDetails?.healthVitals?.sleep || 'N/A'}`,
        //     bgColor: '#E0F2FE',
        // },
        {
            icon: '🩺',
            title: 'Blood Pressure',
            subtitle: 'Today, 9:41 AM',
            value: `${userDetails?.healthVitals?.systolic || 'N/A'}/${userDetails?.healthVitals?.diastolic || 'N/A'}`,
            bgColor: '#BAE6FD',
        },
        {
            icon: '🫁',
            title: 'Blood Oxygen',
            subtitle: 'Latest Reading',
            value: `${userDetails?.healthVitals?.spO2 || 'N/A'}%`,
            bgColor: '#E0F2FE',
        },
        {
            icon: '🏃',
            title: 'Activity',
            subtitle: 'Steps Today',
            value: `${userDetails?.today?.steps || 'N/A'}`,
            bgColor: '#BAE6FD',
        },
        {
            icon: '🔥',
            title: 'Steps & Calories',
            subtitle: 'Today kcal',
            value: `${userDetails?.today?.caloriesKcal.toFixed(2) || 'N/A'} kcal`,
            bgColor: '#E0F2FE',
        },
    ];

    const formatDate = () => {
        return new Date().toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            weekday: 'long'
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0EA5E9" />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.profileIcon}>
                            <Text style={styles.profileEmoji}>👤</Text>
                        </View>
                        <Text style={styles.headerDate}>{formatDate()}</Text>
                        {/* <TouchableOpacity style={styles.editButton}>
                            <Text style={styles.editIcon}>✏️</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>

                {/* Hero Card */}
                <View style={styles.heroContainer}>
                    <View style={styles.heroCard}>
                        {/* Exercise Image Placeholder */}
                        <View style={styles.heroImage}>
                            <Text style={styles.heroEmoji}>🏋️</Text>
                        </View>

                        {/* Achievement Section */}
                        <View style={styles.achievementSection}>
                            <Text style={styles.achievementTitle}>Great Job!</Text>
                            <Text style={styles.achievementText}>
                                You've met your step goal 5 days in a row.
                            </Text>
                            <Text style={styles.achievementText}>
                                Your weekly trend is positive.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Your Metrics Section */}
                <View style={styles.metricsSection}>
                    <Text style={styles.sectionTitle}>Your Metrics</Text>

                    {metrics.map((metric, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.metricCard}
                            activeOpacity={0.7}
                        >
                            <View style={styles.metricContent}>
                                {/* Icon */}
                                <View style={[styles.metricIcon, { backgroundColor: metric.bgColor }]}>
                                    <Text style={styles.metricEmoji}>{metric.icon}</Text>
                                </View>

                                {/* Text Content */}
                                <View style={styles.metricTextContainer}>
                                    <Text style={styles.metricTitle}>{metric.title}</Text>
                                    <Text style={styles.metricSubtitle}>{metric.subtitle}</Text>
                                </View>

                                {/* Value & Arrow */}
                                <View style={styles.metricRight}>
                                    <Text style={styles.metricValue}>{metric.value}</Text>
                                    {/* <Text style={styles.metricArrow}>›</Text> */}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        backgroundColor: '#0EA5E9',
        paddingTop: 10,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileEmoji: {
        fontSize: 20,
    },
    headerDate: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editIcon: {
        fontSize: 18,
    },
    heroContainer: {
        paddingHorizontal: 16,
        marginTop: 10,
    },
    heroCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    heroImage: {
        height: 192,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroEmoji: {
        fontSize: 80,
    },
    achievementSection: {
        backgroundColor: '#38BDF8',
        padding: 16,
    },
    achievementTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    achievementText: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.95,
        marginBottom: 4,
    },
    metricsSection: {
        paddingHorizontal: 16,
        marginTop: 24,
        marginBottom: 100
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    metricCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    metricContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    metricIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    metricEmoji: {
        fontSize: 24,
    },
    metricTextContainer: {
        flex: 1,
    },
    metricTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    metricSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    metricRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metricValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginRight: 8,
    },
    metricArrow: {
        fontSize: 24,
        color: '#9CA3AF',
        fontWeight: '300',
    },
    bottomSpacer: {
        height: 32,
    },
});

export default Calories;