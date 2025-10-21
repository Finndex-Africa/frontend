'use client';

import React from 'react';
import { Card } from 'antd';
import { Column } from '@ant-design/charts';
import type { AgentPerformance } from '@/types/dashboard';
import { designTokens } from '@/config/theme';

interface AgentPerformanceChartProps {
  data: AgentPerformance[];
  loading?: boolean;
}

export const AgentPerformanceChart: React.FC<AgentPerformanceChartProps> = ({
  data,
  loading = false,
}) => {
  const config = {
    data,
    xField: 'agentName',
    yField: 'totalProperties',
    color: designTokens.colors.accent,
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    label: {
      position: 'top' as const,
      style: {
        fill: designTokens.colors.text,
        fontSize: 12,
        fontWeight: 600,
      },
    },
    tooltip: {
      showTitle: true,
    },
    xAxis: {
      label: {
        style: {
          fill: designTokens.colors.muted,
          fontSize: 12,
        },
        autoRotate: true,
        autoHide: true,
      },
      line: {
        style: {
          stroke: designTokens.colors.gray300,
        },
      },
      tickLine: null,
    },
    yAxis: {
      label: {
        style: {
          fill: designTokens.colors.muted,
          fontSize: 12,
        },
      },
      grid: {
        line: {
          style: {
            stroke: designTokens.colors.gray200,
            lineDash: [4, 4],
          },
        },
      },
    },
    animation: false, // No flashy animations
  };

  return (
    <Card
      title="Agent Performance"
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
        <Column {...config} />
      </div>
    </Card>
  );
};
