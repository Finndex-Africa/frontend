'use client';

import React from 'react';
import { Card } from 'antd';
import { Pie } from '@ant-design/charts';
import type { PropertyTypeDistribution } from '@/types/dashboard';
import { designTokens } from '@/config/theme';

interface PropertyTypeDistributionChartProps {
  data: PropertyTypeDistribution[];
  loading?: boolean;
}

export const PropertyTypeDistributionChart: React.FC<PropertyTypeDistributionChartProps> = ({
  data,
  loading = false,
}) => {
  const config = {
    data,
    angleField: 'count',
    colorField: 'type',
    radius: 0.8,
    animation: false,
  };

  return (
    <Card
      title="Distribution by Type"
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
        <Pie {...config} />
      </div>
    </Card>
  );
};
