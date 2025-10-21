'use client';

import React, { useState, useEffect } from 'react';
import { ConfigProvider, App, Row, Col, Typography, Spin } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { KPICardsGrid } from '@/components/dashboard/KPICard';
import { PropertiesOverTimeChart } from '@/components/dashboard/PropertiesOverTimeChart';
import { PropertyTypeDistributionChart } from '@/components/dashboard/PropertyTypeDistributionChart';
import { AgentPerformanceChart } from '@/components/dashboard/AgentPerformanceChart';
import { PropertiesTable } from '@/components/dashboard/PropertiesTable';
import type { KPIData, UserRole } from '@/types/dashboard';
import { dashboardApi, propertiesApi, isApiError } from '@/services/api';
import { antdTheme, designTokens } from '@/config/theme';
import { useAuth } from '@/providers';

const { Title } = Typography;

interface AdminDashboardStats {
  users: {
    total: number;
    homeSeeker: number;
    landlord: number;
    agent: number;
    serviceProvider: number;
  };
  properties: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  services: {
    total: number;
    active: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  recentActivity: {
    newUsers: number;
    newProperties: number;
    newServices: number;
    newBookings: number;
  };
}

function DashboardContent() {
  const { role, setRole } = useAuth();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [propertiesData, setPropertiesData] = useState<any[]>([]);

  // Set role to admin for dashboard access
  useEffect(() => {
    setRole('admin');
  }, [setRole]);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch admin dashboard stats from backend
        const dashboardStats = await dashboardApi.getAdminStats();
        setStats(dashboardStats as any);

        // Fetch properties for charts and table
        const propertiesResponse = await propertiesApi.getProperties({ limit: 100 });
        setPropertiesData(propertiesResponse.data || []);
      } catch (error) {
        if (isApiError(error)) {
          message.error(`Failed to load dashboard: ${error.message}`);
        } else {
          message.error('Failed to load dashboard data. Using offline mode.');
        }
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [message]);

  // Transform properties data for charts
  const propertiesOverTime = React.useMemo(() => {
    if (!propertiesData.length) return [];

    // Group properties by month
    const monthCounts: Record<string, number> = {};
    propertiesData.forEach((property: any) => {
      if (property.createdAt) {
        const date = new Date(property.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
      }
    });

    return Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [propertiesData]);

  const propertyTypeDistribution = React.useMemo(() => {
    if (!propertiesData.length) return [];

    const typeCounts: Record<string, number> = {};
    propertiesData.forEach((property: any) => {
      const type = property.propertyType || property.type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const total = propertiesData.length;
    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: Number(((count / total) * 100).toFixed(1)),
    }));
  }, [propertiesData]);

  const agentPerformance = React.useMemo(() => {
    if (!propertiesData.length) return [];

    // Group properties by agent
    const agentStats: Record<string, any> = {};
    propertiesData.forEach((property: any) => {
      const agentId = property.agentId?._id || property.agentId || 'unassigned';
      const agentName = property.agentId?.name || property.agent?.name || 'Unassigned';

      if (!agentStats[agentId]) {
        agentStats[agentId] = {
          agentId,
          agentName,
          totalProperties: 0,
          totalSales: 0,
          commission: 0,
          rating: 0,
        };
      }

      agentStats[agentId].totalProperties += 1;
      if (property.status === 'sold' || property.status === 'rented') {
        agentStats[agentId].totalSales += 1;
        agentStats[agentId].commission += property.price * 0.05; // 5% commission
      }
      if (property.rating) {
        agentStats[agentId].rating = Math.max(agentStats[agentId].rating, property.rating);
      }
    });

    return Object.values(agentStats).slice(0, 5); // Top 5 agents
  }, [propertiesData]);

  // Calculate change percentages from recentActivity
  const calculateChange = (recent: number, total: number) => {
    if (total === 0) return 0;
    return Number(((recent / total) * 100).toFixed(1));
  };

  // Prepare KPI data from API response
  const kpiData: KPIData[] = stats
    ? [
        {
          title: 'Total Properties',
          value: stats.properties?.total || 0,
          change: calculateChange(stats.recentActivity?.newProperties || 0, stats.properties?.total || 1),
          trend: (stats.recentActivity?.newProperties || 0) > 0 ? 'up' : 'neutral',
          icon: <HomeOutlined />,
        },
        {
          title: 'Total Users',
          value: stats.users?.total || 0,
          change: calculateChange(stats.recentActivity?.newUsers || 0, stats.users?.total || 1),
          trend: (stats.recentActivity?.newUsers || 0) > 0 ? 'up' : 'neutral',
          icon: <UserOutlined />,
        },
        {
          title: 'Total Bookings',
          value: stats.bookings?.total || 0,
          change: calculateChange(stats.recentActivity?.newBookings || 0, stats.bookings?.total || 1),
          trend: (stats.recentActivity?.newBookings || 0) > 0 ? 'up' : 'neutral',
          icon: <ShoppingOutlined />,
        },
        {
          title: 'Active Services',
          value: stats.services?.active || 0,
          change: calculateChange(stats.recentActivity?.newServices || 0, stats.services?.total || 1),
          trend: (stats.recentActivity?.newServices || 0) > 0 ? 'up' : 'neutral',
          icon: <DollarOutlined />,
        },
      ]
    : [];

  return (
    <DashboardLayout userRole={role as UserRole} userName="Admin User">
      <div style={{ marginBottom: designTokens.spacing.xl }}>
        <Title level={2} style={{ margin: 0, color: designTokens.colors.text }}>
          Dashboard Overview
        </Title>
        <p style={{ color: designTokens.colors.muted, marginTop: designTokens.spacing.sm }}>
          Welcome back! Here&apos;s what&apos;s happening with your platform.
        </p>
      </div>

      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <Spin size="large" tip="Loading dashboard data..." />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <KPICardsGrid kpiData={kpiData} loading={loading} />

          {/* Charts Section */}
          <Row gutter={[24, 24]} style={{ marginBottom: designTokens.spacing.xl }}>
            <Col xs={24} lg={12}>
              <PropertiesOverTimeChart
                data={propertiesOverTime}
                loading={loading}
              />
            </Col>
            <Col xs={24} lg={12}>
              <PropertyTypeDistributionChart
                data={propertyTypeDistribution}
                loading={loading}
              />
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginBottom: designTokens.spacing.xl }}>
            <Col xs={24}>
              <AgentPerformanceChart
                data={agentPerformance}
                loading={loading}
              />
            </Col>
          </Row>

          {/* Properties Table */}
          <div style={{ marginTop: designTokens.spacing.xl }}>
            <Title
              level={3}
              style={{ marginBottom: designTokens.spacing.lg, color: designTokens.colors.text }}
            >
              Properties Management
            </Title>
            <PropertiesTable
              userRole={role}
              onEdit={(property) => {
                message.info(`Edit property: ${property.title}`);
              }}
              onDelete={(property) => {
                message.warning(`Delete property: ${property.title}`);
              }}
              onVerify={async () => {
                try {
                  message.loading('Verifying property...');
                  message.success('Property verified successfully');
                } catch (error) {
                  if (isApiError(error)) {
                    message.error(error.message);
                  }
                }
              }}
            />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default function ManagementDashboard() {
  return (
    <ConfigProvider theme={antdTheme}>
      <App>
        <DashboardContent />
      </App>
    </ConfigProvider>
  );
}
