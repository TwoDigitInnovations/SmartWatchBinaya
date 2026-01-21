import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { getHourlyActivityTimeline, getLast12HoursTimeline } from '../db/Dao/StepDao';

const ActivityDurationCard = ({ userId }) => {
    const [timelineData, setTimelineData] = useState([]);
    const [totalDuration, setTotalDuration] = useState({ hours: 0, minutes: 0 });
    const [view, setView] = useState('24hour'); // '24hour' or '12hour'

    useEffect(() => {
        loadData();

        const interval = setInterval(loadData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [userId, view]);

    const loadData = async () => {
        if (view === '24hour') {
            const data = await getHourlyActivityTimeline(userId);
            setTimelineData(data.timeline);
            setTotalDuration(data.totalDuration);
        } else {
            // Load last 12 hours
            const data = await getLast12HoursTimeline(userId);
            setTimelineData(data.timeline);
            setTotalDuration(data.totalDuration);
        }
    };

    const getColor = (steps) => {
        if (steps === 0) return '#F5E6D3';
        if (steps < 500) return '#FFB84D';
        if (steps < 1000) return '#7BA3CC';
        return '#90EE90';
    };

    const getBlockWidth = (duration) => {
        const screenWidth = Dimensions.get('window').width - 60;
        const totalMinutes = view === '24hour' ? 24 * 60 : 12 * 60;
        return (duration / totalMinutes) * screenWidth;
    };

    const getTimeLabels = () => {
        if (view === '24hour') {
            return ['12AM', '6AM', '12PM', '6PM', '11PM'];
        } else {
            const now = new Date();
            const currentHour = now.getHours();
            const labels = [];

            for (let i = 0; i < 5; i++) {
                const hour = currentHour - (11 - Math.floor(i * 3));
                const displayHour = ((hour % 24) + 24) % 24;
                const label = displayHour === 0 ? '12AM' :
                    displayHour < 12 ? `${displayHour}AM` :
                        displayHour === 12 ? '12PM' :
                            `${displayHour - 12}PM`;
                labels.push(label);
            }

            return labels;
        }
    };

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.icon}>⏱️</Text>
                    <Text style={styles.title}>Activity Duration</Text>
                </View>

                {/* View Toggle */}
                {/* <TouchableOpacity
                    onPress={() => setView(view === '24hour' ? '12hour' : '24hour')}
                    style={styles.toggleButton}
                >
                    <Text style={styles.toggleText}>
                        {view === '24hour' ? '12h' : '24h'}
                    </Text>
                </TouchableOpacity> */}
            </View>

            {/* Duration */}
            <Text style={styles.duration}>
                {totalDuration.hours}h {totalDuration.minutes}m
            </Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
                Activity Timeline • {view === '24hour' ? '24-Hour View' : '12-Hour View'}
            </Text>

            {/* Timeline Container */}
            <View style={styles.timelineContainer}>
                {/* Activity Blocks */}
                <View style={styles.blocksRow}>
                    {timelineData.map((activity, index) => (
                        <View
                            key={index}
                            style={[
                                styles.activityBlock,
                                {
                                    backgroundColor: getColor(activity.steps),
                                    width: getBlockWidth(activity.duration),
                                    borderRadius: 8,
                                }
                            ]}
                        />
                    ))}
                </View>

                {/* Time Labels */}
                <View style={styles.labelsRow}>
                    {getTimeLabels().map((label, index) => (
                        <Text key={index} style={styles.timeLabel}>{label}</Text>
                    ))}
                </View>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#F5E6D3' }]} />
                    <Text style={styles.legendText}>No Activity</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#FFB84D' }]} />
                    <Text style={styles.legendText}>Low</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#7BA3CC' }]} />
                    <Text style={styles.legendText}>Medium</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#90EE90' }]} />
                    <Text style={styles.legendText}>High</Text>
                </View>
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
        width: Dimensions.get('window').width - 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
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
    toggleButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    duration: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: '#666',
        marginBottom: 20,
    },
    timelineContainer: {
        marginTop: 10,
        width: Dimensions.get('window').width - 80,
        overflow: 'hidden',
    },
    blocksRow: {
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
        backgroundColor: '#F5E6D3',
        borderRadius: 12,
        padding: 5,
        gap: 5,
    },
    activityBlock: {
        height: 40,
    },
    labelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingHorizontal: 5,
    },
    timeLabel: {
        fontSize: 11,
        color: '#999',
        fontWeight: '500',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 3,
        marginRight: 5,
    },
    legendText: {
        fontSize: 10,
        color: '#666',
    },
});

export default ActivityDurationCard;