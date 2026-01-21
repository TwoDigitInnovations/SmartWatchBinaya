

import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import { FitCloudContext } from '../components/FitCloudContext';
import { getDashboardHealthData, getStepData, queryAppUsageCountStatistics, requestLatestHealthMeasurementData } from '../components/FitCloudSteps';
import { useIsFocused } from '@react-navigation/native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { getDailyGoal, goalData } from '../components/FitcloudGoal';
import BloodPressureChart from '../components/BloodPresureChatr'

import {
    getAllActivity,
    getMonthlyActivity,
    getMonthlyTotals,
    getTodayActivity,
    getTodayTotals,
    getWeeklyActivity,
    getWeeklyTotals,
    insertGoals,
    insertHealthVitals,
    insertTodaySummary,
    getHourlyActivityForChart,
    insertHourlyActivity
} from '../db/Dao/StepDao';
import HeartRateDemo from '../components/HeartRateCard';
import {
    initBackgroundFetch,
    stopBackgroundFetch,
    getBackgroundFetchStatus
} from '../components/backgroundTaskConfig';
import StepsCaloriesCard from '../components/StepCaloriesCard';
import ActivityDurationCard from '../components/ActivityDuration';
import HealthMetricsCards from '../components/bloodOxizenCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const progressData = [
    { label: "Swim", value: 1, color: "#0374FF" },
    { label: "Bike", value: 0.6, color: "#FFA400" },
    { label: "Run", value: 0.8, color: "#FF0000" },
    { label: "Run", value: 0.8, color: "#5DE542" },
];

const screenWidth = Dimensions.get("window").width;
const HomeScreen = () => {
    const insets = useSafeAreaInsets();
    const isFocus = useIsFocused()
    const [selectedPeriod, setSelectedPeriod] = useState('Day');
    const { api, userDetails, setUserDetails } = useContext(FitCloudContext);
    const [totals, setTotals] = useState({
        steps: 0, distance: 0, calories: 0
    });
    console.log("User details in Home screen:", userDetails);

    const periods = ['Day', 'Week', 'Month'];

    useEffect(() => {

        getDashboardHealthData(data => {
            // console.log("Daily goal data in Home screen:", data);
            setUserDetails({ ...userDetails, healthVitals: data.healthVitals, goals: data.goals, today: data.today, userId: data.userId });
            insertHealthVitals({ ...data.healthVitals, userId: data.userId }).then(res => {
                // console.log("Inserted health vitals with result:", res);
            });
            insertTodaySummary({ ...data.today, userId: data.userId });
            insertGoals({ ...data.goals, userId: data.userId });
            if (data.userId) {
                AsyncStorage.setItem('userId', data.userId);
                Historydata(data.userId)
            }

        });


    }, [isFocus])

    useEffect(() => {
        const loadStepsData = async () => {
            if (selectedPeriod === 'Day') {
                const todayTotals = await getTodayTotals(userDetails?.userId);
                setTotals(todayTotals);
                // console.log("Today's totals:", todayTotals);
            }
            if (selectedPeriod === 'Week') {
                const todayTotals = await getWeeklyTotals(userDetails?.userId);
                setTotals(todayTotals);
                // console.log("Weekly totals:", todayTotals);
            }
            if (selectedPeriod === 'Month') {
                const todayTotals = await getMonthlyTotals(userDetails?.userId);
                setTotals(todayTotals);
                // console.log("Monthly totals:", todayTotals);
            }

            await initBackgroundFetch(userDetails?.userId, userDetails?.today?.steps, userDetails?.today?.caloriesKcal);
            await insertHourlyActivity(userDetails?.userId, userDetails?.today?.steps, userDetails?.today?.caloriesKcal);


            setTimeout(() => {
                getHourlyActivityForChart(userDetails?.userId).then(res => {
                    // console.log("Hourly activity for chart:", res);
                })
            }, 200);
        }

        if (userDetails?.userId) {
            loadStepsData()
        }


    }, [selectedPeriod, userDetails])



    // console.log("Totals state:", totals);
    const Historydata = async (id) => {
        getTodayActivity(id).then(res => {
            // console.log("Today's activity from DB:", res);
        })
        getWeeklyActivity(id).then(res => {
            // console.log("Weekly activity from DB:", res);
        })
        getMonthlyActivity(id).then(res => {
            // console.log("Monthly activity from DB:", res);
        })
        const allActivity = await getAllActivity(id);
        // console.log("All activity from DB:", allActivity);
        const todayTotals = await getTodayTotals(id);
        setTotals(todayTotals);
    }

    return (
        <ScrollView style={[styles.container, { paddingBottom: insets.bottom + 50 }]}>
            {/* Header */}
            <LinearGradient colors={['#049CDB', '#E0F2FE']}>
                <View style={styles.header}>
                    <View style={styles.profileIcon} />
                    <Text style={styles.headerTitle}>Dashboard</Text>
                    <View style={styles.headerRight} />
                </View>

                {/* Period Selector */}
                <View style={styles.periodSelector}>
                    {periods.map((period) => (
                        <TouchableOpacity
                            key={period}
                            style={[
                                styles.periodButton,
                                selectedPeriod === period && styles.periodButtonActive,
                            ]}
                            onPress={() => setSelectedPeriod(period)}
                        >
                            <Text
                                style={[
                                    styles.periodText,
                                    selectedPeriod === period && styles.periodTextActive,
                                ]}
                            >
                                {period}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>


                {/* Steps Circle */}
                <View style={{ alignItems: 'center', width: screenWidth, height: 220, justifyContent: 'center', position: 'relative', marginVertical: 30 }}>
                    {/* {progressData.map((item, index) => (
                        <ProgressChart
                            key={index}
                            data={{
                                labels: [item.label],
                                data: [item.value],
                            }}
                            width={screenWidth}
                            height={220}
                            strokeWidth={10}
                            radius={90 - index * 20}
                            hideLegend
                            chartConfig={{
                                backgroundGradientFrom: "transparent",
                                backgroundGradientFromOpacity: 0,
                                backgroundGradientTo: "transparent",
                                backgroundGradientToOpacity: 0,
                                strokeWidth: 1, // optional, default 3
                                barPercentage: 0.5,
                                useShadowColorFromDataset: false,
                                color: () => item.color,

                            }}
                            style={{ position: 'absolute', backgroundColor: 'transparent' }}
                        />
                    ))} */}
                    <AnimatedCircularProgress
                        style={{ position: 'absolute' }}
                        size={220}
                        width={10}
                        fill={((totals?.steps || 0) * 100) / (userDetails?.goals?.steps || 1)}
                        tintColor="#0374FF"
                        onAnimationComplete={() => console.log('onAnimationComplete')}
                        backgroundColor="#0374FF30" />
                    <AnimatedCircularProgress
                        style={{ position: 'absolute' }}
                        size={190}
                        width={10}
                        fill={((totals?.calories || 0) * 100) / (userDetails?.goals?.caloriesKcal || 1)}
                        tintColor="#FFA400"
                        onAnimationComplete={() => console.log('onAnimationComplete')}
                        backgroundColor="#FFA40030" />
                    <AnimatedCircularProgress
                        style={{ position: 'absolute' }}
                        size={160}
                        width={10}
                        fill={((totals?.distance || 0) * 100) / (userDetails?.goals?.distanceKm || 1)}

                        tintColor="#FF0000"
                        onAnimationComplete={() => console.log('onAnimationComplete')}
                        backgroundColor="#FF000030" />
                    <View style={{ alignItems: 'center', position: 'absolute' }}>
                        <Text style={{ fontSize: 24, fontWeight: 'semibold', color: '#000' }}>{(totals?.steps || 0)} </Text>
                        <Text style={{ fontSize: 24, fontWeight: 'semibold', color: '#000' }}>Steps</Text>
                    </View>
                </View>

                {/* Metrics Row */}
                <View style={styles.metricsRow}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricIcon}>🚶</Text>
                        <Text style={styles.metricLabel}>Distance</Text>
                        <Text style={styles.metricValue}>{(totals?.distance || 0).toFixed(2)} <Text style={styles.metricUnit}>km</Text></Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricIcon}>🔥</Text>
                        <Text style={styles.metricLabel}>Consumption</Text>
                        <Text style={styles.metricValue}>{(totals?.calories || 0).toFixed(2)} <Text style={styles.metricUnit}>kcal</Text></Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricIcon}>🎯</Text>
                        <Text style={styles.metricLabel}>Target</Text>
                        <Text style={styles.metricValue}>incomplete</Text>
                    </View>
                </View>
            </LinearGradient>


            {/* Health Vitals Section */}
            <Text style={styles.sectionTitle}>Health Vitals</Text>

            <HeartRateDemo bpm={userDetails?.healthVitals?.bpm} userId={userDetails?.userId} />

            {/* Heart Rate Card */}
            {/* <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>❤️</Text>
                    <Text style={styles.cardTitle}>Heart Rate</Text>
                </View>
                <Text style={styles.cardValue}>{userDetails?.healthVitals?.bpm || 0} BPM</Text>
                <Text style={styles.cardSubtext}>Range: 58-124 +2%</Text>
                <View style={styles.chartArea}>
                    <View style={styles.heartRateChart} />
                </View>
            </View> */}

            {/* Sleep Card */}
            {/* <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>🌙</Text>
                    <Text style={styles.cardTitle}>Sleep</Text>
                </View>
                <Text style={styles.cardValue}>7h 30m</Text>
                <Text style={styles.cardSubtext}>Last night: +2%</Text>
                <View style={styles.sleepBars}>
                    <View style={styles.sleepBarRow}>
                        <Text style={styles.sleepLabel}>Deep</Text>
                        <View style={styles.sleepBarContainer}>
                            <View style={[styles.sleepBar, { width: '45%', backgroundColor: '#3B82F6' }]} />
                        </View>
                    </View>
                    <View style={styles.sleepBarRow}>
                        <Text style={styles.sleepLabel}>Light</Text>
                        <View style={styles.sleepBarContainer}>
                            <View style={[styles.sleepBar, { width: '70%', backgroundColor: '#60A5FA' }]} />
                        </View>
                    </View>
                    <View style={styles.sleepBarRow}>
                        <Text style={styles.sleepLabel}>Awake</Text>
                        <View style={styles.sleepBarContainer}>
                            <View style={[styles.sleepBar, { width: '20%', backgroundColor: '#C084FC' }]} />
                        </View>
                    </View>
                </View>
            </View> */}

            {/* Steps & Calories Card */}
            {/* <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>👟</Text>
                    <Text style={styles.cardTitle}>Steps & Calories</Text>
                </View>
                <Text style={styles.cardValue}>7500</Text>
                <Text style={styles.cardSubtext}>Total steps: +2%</Text>
                <View style={styles.barChart}>
                    {[0.5, 0.8, 0.4, 0.95, 0.7, 0.9, 0.6].map((height, index) => (
                        <View
                            key={index}
                            style={[styles.barChartColumn, { height: `${height * 100}%` }]}
                        />
                    ))}
                </View>
                <View style={styles.chartLabels}>
                    <Text style={styles.chartLabel}>12AM</Text>
                    <Text style={styles.chartLabel}>1PM</Text>
                    <Text style={styles.chartLabel}>2PM</Text>
                    <Text style={styles.chartLabel}>3PM</Text>
                    <Text style={styles.chartLabel}>4PM</Text>
                    <Text style={styles.chartLabel}>5PM</Text>
                    <Text style={styles.chartLabel}>6PM</Text>
                </View>
            </View> */}

            <StepsCaloriesCard userId={userDetails?.userId} />

            {/* Activity Duration Card */}
            {/* <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>⏱️</Text>
                    <Text style={styles.cardTitle}>Activity Duration</Text>
                </View>
                <Text style={styles.cardValue}>1h 25m</Text>
                <Text style={styles.cardSubtext}>Activity Timeline - 24-Hour View</Text>
                <View style={styles.activityTimeline}>
                    <View style={[styles.activityBlock, { width: '15%', backgroundColor: '#FED7AA' }]} />
                    <View style={[styles.activityBlock, { width: '18%', backgroundColor: '#FB923C' }]} />
                    <View style={[styles.activityBlock, { width: '25%', backgroundColor: '#60A5FA' }]} />
                    <View style={[styles.activityBlock, { width: '12%', backgroundColor: '#4ADE80' }]} />
                    <View style={[styles.activityBlock, { width: '15%', backgroundColor: '#FED7AA' }]} />
                </View>
                <View style={styles.chartLabels}>
                    <Text style={styles.chartLabel}>12AM</Text>
                    <Text style={styles.chartLabel}>1PM</Text>
                    <Text style={styles.chartLabel}>2PM</Text>
                    <Text style={styles.chartLabel}>3PM</Text>
                    <Text style={styles.chartLabel}>4PM</Text>
                </View>
            </View> */}
            <ActivityDurationCard userId={userDetails?.userId} />

            {/* Blood Pressure Card */}
            <View style={[styles.card, { padding: 0 }]}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>💗</Text>
                    <Text style={styles.cardTitle}>Blood Pressure</Text>
                </View>
                <Text style={styles.cardValue}>{userDetails?.healthVitals?.systolic || 0}/{userDetails?.healthVitals?.diastolic || 0}</Text>
                {/* <Text style={styles.cardSubtext}>Last sync: 10:45 AM</Text>
                <View style={styles.bloodPressureChart}>
                    {[0.9, 0.85, 0.4, 0.45, 0.35, 0.95, 0.5].map((height, index) => (
                        <View
                            key={index}
                            style={[
                                styles.bpBar,
                                { height: `${height * 100}%`, opacity: height > 0.7 ? 1 : 0.4 },
                            ]}
                        />
                    ))}
                </View> */}
                <BloodPressureChart userId={userDetails?.userId} />

            </View>

            {/* Blood Oxygen Card */}
            {/* <View style={[styles.card, { marginBottom: 100 }]}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>🫁</Text>
                    <Text style={styles.cardTitle}>Blood Oxygen</Text>
                </View>
                <Text style={styles.cardValue}>{userDetails?.healthVitals?.spO2 || 0}%</Text>
                <Text style={styles.cardSubtext}>Last sync: 10:54 AM</Text>
                <View style={styles.oxygenChart}>
                    <View style={styles.oxygenLine} />
                </View>

            </View> */}
            <View style={{ marginBottom: 100 }}>
                <HealthMetricsCards userId={userDetails?.userId} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E0F2FE',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#BAE6FD',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    headerRight: {
        width: 40,
    },
    periodSelector: {
        flexDirection: 'row',
        marginHorizontal: 20,
        // marginBottom: 30,
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 4,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    periodButtonActive: {
        backgroundColor: '#1E3A8A',
    },
    periodText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    periodTextActive: {
        color: '#FFFFFF',
    },
    stepsContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    stepsCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 8,
        borderColor: '#FB923C',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    stepsNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1E293B',
    },
    stepsLabel: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
    },
    metricsRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 30,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        justifyContent: 'space-between',
    },
    metricCard: {
        alignItems: 'center',
        flex: 1,
    },
    metricIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    metricLabel: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    metricUnit: {
        fontSize: 12,
        fontWeight: '400',
        color: '#64748B',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginLeft: 20,
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 20,
        overflow: 'hidden'
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingLeft: 20,
        paddingTop: 20
    },
    cardIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    cardValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
        paddingLeft: 20
    },
    cardSubtext: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 15,
    },
    chartArea: {
        height: 100,
        marginTop: 10,
    },
    heartRateChart: {
        flex: 1,
        backgroundColor: '#FCA5A5',
        borderRadius: 8,
        opacity: 0.6,
    },
    sleepBars: {
        marginTop: 10,
    },
    sleepBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sleepLabel: {
        width: 50,
        fontSize: 12,
        color: '#64748B',
    },
    sleepBarContainer: {
        flex: 1,
        height: 10,
        backgroundColor: '#F1F5F9',
        borderRadius: 5,
        overflow: 'hidden',
    },
    sleepBar: {
        height: '100%',
        borderRadius: 5,
    },
    barChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 100,
        marginTop: 10,
    },
    barChartColumn: {
        flex: 1,
        backgroundColor: '#FED7AA',
        marginHorizontal: 2,
        borderRadius: 4,
    },
    chartLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    chartLabel: {
        fontSize: 10,
        color: '#94A3B8',
    },
    activityTimeline: {
        flexDirection: 'row',
        height: 60,
        marginTop: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
    activityBlock: {
        height: '100%',
        marginHorizontal: 2,
        borderRadius: 8,
    },
    bloodPressureChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 100,
        marginTop: 10,
    },
    bpBar: {
        flex: 1,
        backgroundColor: '#06B6D4',
        marginHorizontal: 3,
        borderRadius: 8,
    },
    oxygenChart: {
        height: 100,
        marginTop: 10,
        justifyContent: 'center',
    },
    oxygenLine: {
        height: 2,
        backgroundColor: '#FB7185',
        borderRadius: 1,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        paddingBottom: 30,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
    },
    navIcon: {
        fontSize: 24,
        color: '#64748B',
    },
});

export default HomeScreen;