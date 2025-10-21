'use client';

import React from 'react';
import { Card } from 'antd';
import { Line } from '@ant-design/charts';
import type { ChartDataPoint } from '@/types/dashboard';
import { designTokens } from '@/config/theme';

interface PropertiesOverTimeChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

export const PropertiesOverTimeChart: React.FC<PropertiesOverTimeChartProps> = ({
  data,
  loading = false,
}) => {
  const config = {
    data,
    xField: 'date',
    yField: 'count',
    smooth: true,
    color: designTokens.colors.brand,
    animation: false,
  };

  return (
    <Card
      title="Properties Over Time"
      variant="borderless"
      loading={loading}
      style={{
        height: '100%',
        boxShadow: designTokens.shadows.base,
      }}
      styles={{
        header: {
          borderBottom: `1px solid ${designTokens.colors.gray200}`,
          fontSize: designTokens.fontSize.lg,
          fontWeight: designTokens.fontWeight.semibold,
          color: designTokens.colors.text,
        },
      }}
    >
      <div style={{ height: 300 }}>
        <Line {...config} />
      </div>
    </Card>
  );
};
