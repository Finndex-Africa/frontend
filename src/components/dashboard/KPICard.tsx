'use client';

import React from 'react';
import { Card, Statistic, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { KPIData } from '@/types/dashboard';
import { designTokens } from '@/config/theme';

interface KPICardProps {
  data: KPIData;
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({ data, loading = false }) => {
  const { title, value, change, trend, icon, suffix, prefix } = data;

  const getTrendColor = () => {
    if (!trend || trend === 'stable') return designTokens.colors.muted;
    return trend === 'up' ? designTokens.colors.success : designTokens.colors.error;
  };

  const getTrendIcon = () => {
    if (!trend || trend === 'stable') return null;
    return trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  };

  return (
    <Card
      variant="borderless"
      loading={loading}
      style={{
        height: '100%',
        boxShadow: designTokens.shadows.base,
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: designTokens.fontSize.sm,
              color: designTokens.colors.muted,
              fontWeight: designTokens.fontWeight.medium,
            }}
          >
            {title}
          </span>
          {icon && (
            <span style={{ fontSize: '24px', color: designTokens.colors.brand }}>
              {icon}
            </span>
          )}
        </div>

        <Statistic
          value={value}
          suffix={suffix}
          prefix={prefix}
          valueStyle={{
            fontSize: designTokens.fontSize['3xl'],
            fontWeight: designTokens.fontWeight.bold,
            color: designTokens.colors.text,
          }}
        />

        {change !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: getTrendColor(), fontSize: designTokens.fontSize.sm }}>
              {getTrendIcon()}
            </span>
            <span
              style={{
                color: getTrendColor(),
                fontSize: designTokens.fontSize.sm,
                fontWeight: designTokens.fontWeight.medium,
              }}
            >
              {Math.abs(change)}%
            </span>
            <span
              style={{
                color: designTokens.colors.muted,
                fontSize: designTokens.fontSize.sm,
              }}
            >
              vs last period
            </span>
          </div>
        )}
      </Space>
    </Card>
  );
};

interface KPICardsGridProps {
  kpiData: KPIData[];
  loading?: boolean;
}

export const KPICardsGrid: React.FC<KPICardsGridProps> = ({ kpiData, loading = false }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: designTokens.spacing.lg,
        marginBottom: designTokens.spacing.xl,
      }}
    >
      {kpiData.map((kpi, index) => (
        <KPICard key={index} data={kpi} loading={loading} />
      ))}
    </div>
  );
};
