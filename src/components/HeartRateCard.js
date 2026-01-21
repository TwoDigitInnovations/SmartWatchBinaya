// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Dimensions } from 'react-native';
// import { LineChart } from 'react-native-chart-kit';

// const HeartRateCard = ({ bpm = 78, minBpm = 58, maxBpm = 124, change = '+2%', chartData = null }) => {
//     // Generate sample heart rate data if not provided
//     const generateHeartRateData = () => {
//         const dataPoints = 20;
//         const data = [];
//         for (let i = 0; i < dataPoints; i++) {
//             // Generate realistic heart rate variations
//             const variation = Math.sin(i * 0.5) * 15 + Math.random() * 10;
//             data.push(bpm + variation);
//         }
//         return data;
//     };

//     const heartRateData = chartData || generateHeartRateData();

//     const chartConfig = {
//         backgroundGradientFrom: '#fff',
//         backgroundGradientTo: '#fff',
//         color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
//         strokeWidth: 2,
//         propsForBackgroundLines: {
//             stroke: 'transparent',
//         },
//         propsForDots: {
//             r: '0',
//         },
//     };

//     return (
//         <View style={styles.card}>
//             {/* Header */}
//             <View style={styles.header}>
//                 <View style={styles.iconContainer}>
//                     <Text style={styles.icon}>❤️</Text>
//                 </View>
//                 <Text style={styles.title}>Heart Rate</Text>
//             </View>

//             {/* BPM Value */}
//             <Text style={styles.bpmValue}>{bpm} BPM</Text>

//             {/* Range Info */}
//             <Text style={styles.rangeText}>
//                 Range: {minBpm}-{maxBpm} {change}
//             </Text>

//             {/* Chart */}
//             <View style={styles.chartContainer}>
//                 <LineChart
//                     data={{
//                         labels: [],
//                         datasets: [
//                             {
//                                 data: heartRateData,
//                                 color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
//                                 strokeWidth: 2,
//                             },
//                         ],
//                     }}
//                     width={Dimensions.get('window').width - 60}
//                     height={100}
//                     chartConfig={chartConfig}
//                     bezier
//                     withHorizontalLabels={false}
//                     withVerticalLabels={false}
//                     withInnerLines={false}
//                     withOuterLines={false}
//                     withDots={false}
//                     withShadow={false}
//                     style={styles.chart}
//                     transparent
//                 />
//             </View>
//         </View>
//     );
// };

// // Example usage with multiple cards
// const HeartRateDemo = ({ bpm }) => {
//     return (
//         <View style={styles.container}>
//             <HeartRateCard
//                 bpm={bpm}
//                 minBpm={58}
//                 maxBpm={124}
//                 change="+2%"
//             />

//             {/* <View style={styles.spacer} />

//             <HeartRateCard
//                 bpm={92}
//                 minBpm={65}
//                 maxBpm={135}
//                 change="+5%"
//             /> */}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 16,
//         backgroundColor: '#f5f5f5',
//     },
//     card: {
//         backgroundColor: '#fff',
//         borderRadius: 16,
//         padding: 20,
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//         elevation: 3,
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 12,
//     },
//     iconContainer: {
//         width: 24,
//         height: 24,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 8,
//     },
//     icon: {
//         fontSize: 20,
//     },
//     title: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#333',
//     },
//     bpmValue: {
//         fontSize: 32,
//         fontWeight: 'bold',
//         color: '#000',
//         marginBottom: 4,
//     },
//     rangeText: {
//         fontSize: 13,
//         color: '#666',
//         marginBottom: 16,
//     },
//     chartContainer: {
//         // marginHorizontal: -20,
//         marginBottom: -10,
//         overflow: 'hidden',
//     },
//     chart: {
//         marginLeft: 0,
//         paddingRight: 0,
//     },
//     spacer: {
//         height: 16,
//     },
// });

// export default HeartRateDemo;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { getWeeklyHeartRate, getWeeklySpO2 } from '../db/Dao/StepDao';

const screenWidth = Dimensions.get('window').width;
const oxygenData = {
    labels: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"],
    datasets: [{
        data: [95, 98, 96, 99, 97, 98, 99],
        strokeWidth: 2
    }]
};

const HeartRateDemo = ({ userId, bpm }) => {
    console.log(bpm)

    const [dataSets, setDataSets] = useState(oxygenData)

    useEffect(() => {
        getData()
    }, [userId])

    const getData = async () => {
        const weekData = await getWeeklyHeartRate(userId);
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
                        <View style={styles.iconContainer}>
                            <Text style={styles.icon}>❤️</Text>
                        </View>
                        <Text style={styles.title}>Heart Rate</Text>
                    </View>
                    {/* BPM Value */}
                    <Text style={styles.bpmValue}>{bpm} BPM</Text>

                    {/* Range Info */}
                    <Text style={styles.rangeText}>
                        Range: {65}-{135}
                    </Text>

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
    bpmValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    rangeText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
    },
});

export default HeartRateDemo;