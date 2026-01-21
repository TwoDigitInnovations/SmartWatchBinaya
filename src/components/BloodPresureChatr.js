import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getBloodPressureData, getWeeklyBloodPressure } from '../db/Dao/StepDao';

const screenWidth = Dimensions.get('window').width;

const BloodPressureChart = ({ userId }) => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#2196F3'
        },
        propsForBackgroundLines: {
            strokeWidth: 0 // Hide grid lines
        }
    };

    console.log('from blood chartda ---------->', chartData)

    const loadData = async () => {
        const weekData = await getWeeklyBloodPressure(userId);
        console.log('from blood chart', weekData)
        setChartData(weekData)



    };

    if (!chartData) {
        return <Text>Loading...</Text>;
    }

    return (
        <View>
            <Text style={{ paddingLeft: 20 }}>Blood Pressure (Last 7 Days)</Text>
            <View style={styles.chartContainer}>
                <LineChart
                    data={chartData}
                    width={screenWidth - 20} // Card padding
                    height={120}
                    chartConfig={chartConfig}
                    bezier
                    withInnerLines={false}
                    withOuterLines={false}
                    withVerticalLabels={false}
                    withHorizontalLabels={false}
                    style={styles.chart}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        margin: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heartEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    value: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    lastSync: {
        fontSize: 12,
        color: '#999',
        marginBottom: 10,
    },
    chartContainer: {
        marginLeft: 10,
        marginBottom: 10,
    },
    chart: {
        paddingRight: 0,
    },
});


export default BloodPressureChart;