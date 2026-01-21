import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { getLast6HoursForChart, getLast6HoursActivity } from '../db/Dao/StepDao';

const StepsCaloriesCard = ({ userId }) => {
    const [chartData, setChartData] = useState(null);
    const [totalSteps, setTotalSteps] = useState(0);
    const [totalCalories, setTotalCalories] = useState(0);

    useEffect(() => {
        loadData();

        // Refresh every 5 minutes
        const interval = setInterval(loadData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [userId]);

    const loadData = async () => {
        const data = await getLast6HoursForChart(userId);
        const hourlyData = await getLast6HoursActivity(userId);
        console.log("Hourly Data:", hourlyData);

        // Calculate totals for last 6 hours
        const stepsTotal = hourlyData.reduce((sum, item) => sum + item.steps, 0);
        const caloriesTotal = hourlyData.reduce((sum, item) => sum + item.calories, 0);

        setChartData(data);
        setTotalSteps(hourlyData[5].steps);
        setTotalCalories(hourlyData[5].calories);
    };

    if (!chartData || chartData.steps.length === 0) {
        return (
            <View style={styles.card}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.icon}>👟</Text>
                <Text style={styles.title}>Steps & Calories</Text>
            </View>

            {/* Total Steps (Last 6 hours) */}
            <Text style={styles.totalValue}>{totalSteps.toLocaleString()}</Text>

            {/* Info Text */}
            <Text style={styles.infoText}>
                Last 6 hours: +2%
            </Text>

            {/* Bar Chart */}
            <View style={styles.chartContainer}>
                <BarChart
                    data={{
                        labels: chartData.labels,
                        datasets: [{
                            data: chartData.steps.length > 0 ? chartData.steps : [0]
                        }]
                    }}
                    width={Dimensions.get('window').width - 80}
                    height={170}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(255, 183, 140, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(120, 120, 120, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                        propsForLabels: {
                            fontSize: 9,
                            fontWeight: '400',
                        },
                        barPercentage: 0.7,
                    }}
                    style={styles.chart}
                    withInnerLines={false}
                    withHorizontalLabels={true}
                    withVerticalLabels={true}
                    fromZero={true}
                    showBarTops={false}
                    flatColor={true}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 16,
        marginHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    icon: {
        fontSize: 20,
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
    },
    chartContainer: {
        overflow: 'visible',
        marginHorizontal: -10,
    },
    chart: {
        borderRadius: 16,
    },
});

export default StepsCaloriesCard;