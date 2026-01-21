import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { getWeeklySpO2 } from '../db/Dao/StepDao';

const screenWidth = Dimensions.get('window').width;
const oxygenData = {
    labels: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"],
    datasets: [{
        data: [95, 98, 96, 99, 97, 98, 99],
        strokeWidth: 2
    }]
};

const HealthMetricsCards = ({ userId }) => {

    const [dataSets, setDataSets] = useState(oxygenData)

    useEffect(() => {
        getData()
    }, [userId])

    const getData = async () => {
        const weekData = await getWeeklySpO2(userId);
        if (weekData) {
            setDataSets(weekData)
        }
    }
    // Blood Pressure data
    const bpData = {
        labels: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"],
        datasets: [{
            data: [118, 125, 115, 120, 110, 130, 122]
        }]
    };

    // Blood Oxygen data

    const barChartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, 0)`,
        style: {
            borderRadius: 16,
        },
        propsForBackgroundLines: {
            strokeWidth: 0,
        },
        barPercentage: 0.7,
        fillShadowGradient: '#3b82f6',
        fillShadowGradientOpacity: 1,
    };

    const lineChartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, 0)`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '0',
        },
        propsForBackgroundLines: {
            strokeWidth: 0,
        },
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Blood Pressure Card */}
                {/* <View style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.icon}>🩸</Text>
                        <Text style={styles.title}>Blood Pressure</Text>
                    </View>
                    <Text style={styles.value}>120/80</Text>
                    <Text style={styles.subtitle}>Last sync: 10:45 AM</Text>

                    <View style={styles.chartContainer}>
                        <BarChart
                            data={bpData}
                            width={screenWidth - 80}
                            height={100}
                            chartConfig={barChartConfig}
                            style={styles.chart}
                            withInnerLines={false}
                            showValuesOnTopOfBars={false}
                            withHorizontalLabels={false}
                            fromZero={false}
                        />
                    </View>
                </View> */}

                {/* Blood Oxygen Card */}
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.icon}>❤️</Text>
                        <Text style={styles.title}>Blood Oxygen</Text>
                    </View>
                    <Text style={styles.value}>98%</Text>
                    <Text style={styles.subtitle}>Last sync: 10:54 AM</Text>

                    <View style={styles.chartContainer}>
                        <LineChart
                            data={dataSets}
                            width={screenWidth}
                            height={100}
                            chartConfig={lineChartConfig}
                            bezier
                            style={styles.chart}
                            withInnerLines={false}
                            withOuterLines={false}
                            withHorizontalLabels={false}
                            withVerticalLabels={false}
                            withDots={false}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        padding: 20,
    },
    content: {
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        fontSize: 20,
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
    value: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af',
    },
    chartContainer: {
        marginTop: 16,
        marginLeft: -10,
        marginRight: 10,
        overflow: 'hidden',
    },
    chart: {
        borderRadius: 0,
    },
});

export default HealthMetricsCards;