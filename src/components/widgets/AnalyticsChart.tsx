// components/widgets/AnalyticsChart.tsx
import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../contexts/ThemedContext';

type Props = {
  data: { x: string; y: number }[];
};

const screenWidth = Dimensions.get('window').width;

const AnalyticsChart: React.FC<Props> = ({ data }) => {
  const { colors } = useTheme();
  const isEmpty = data.length === 0;

  const labels = isEmpty ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] : data.map((d) => d.x);
  const values = isEmpty ? [0, 0, 0, 0, 0] : data.map((d) => d.y);

  return (
    <View style={{ marginBottom: 24 }}>
      <LineChart
        data={{
          labels,
          datasets: [{ data: values }],
        }}
        width={screenWidth - 32}
        height={220}
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: colors.background ?? '#fff',
          backgroundGradientFrom: colors.background ?? '#fff',
          backgroundGradientTo: colors.background ?? '#fff',
          decimalPlaces: 0,
          color: () => colors.accent ?? '#4285F4',
          labelColor: () => colors.text ?? '#000',
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: colors.accent ?? '#4285F4',
          },
        }}
        bezier
        style={{
          borderRadius: 8,
        }}
      />

      {isEmpty && (
        <View style={{ position: 'absolute', top: 90, width: '100%', alignItems: 'center' }}>
          <Text style={{ color: colors.muted ?? '#999', fontSize: 14, fontStyle: 'italic' }}>
            Analytics will show upon completion of your first event.
          </Text>
        </View>
      )}
    </View>
  );
};

export default AnalyticsChart;
