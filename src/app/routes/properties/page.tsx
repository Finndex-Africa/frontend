'use client';

import React, { useState, useEffect } from 'react';
import { ConfigProvider, App, Row, Col, Typography, Spin, Card, Statistic } from 'antd';
import {
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { PropertiesTable } from '@/components/dashboard/PropertiesTable';
import type { UserRole } from '@/types/dashboard';
import { propertiesApi, isApiError } from '@/services/api';
import { antdTheme, designTokens } from '@/config/theme';
import { useAuth } from '@/providers';

const { Title } = Typography;

interface PropertyStats {
  total: number;
  available: number;
  rented: number;
  pending: number;
  totalValue: number;
  verified: number;
}

function PropertiesContent() {
  const { role, setRole } = useAuth();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PropertyStats | null>(null);

  // Set role to admin for dashboard access (temporary - replace with actual auth)
  useEffect(() => {
    setRole('admin');
  }, [setRole]);

  // Fetch property statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch properties from API
        const response = await propertiesApi.getProperties({ limit: 1000 });
        const properties = response.data || [];

        // Calculate statistics from actual data
        const total = properties.length;
        const available = properties.filter((p: any) => p.status === 'available').length;
        const rented = properties.filter((p: any) => p.status === 'rented').length;
        const pending = properties.filter((p: any) => p.status === 'pending').length;
        const verified = properties.filter((p: any) => p.verified === true).length;
        const totalValue = properties.reduce((sum: number, p: any) => sum + (p.price || 0), 0);

        setStats({
          total,
          available,
          rented,
          pending,
          totalValue,
          verified,
        });
      } catch (error) {
        if (isApiError(error)) {
          message.error(`Failed to load properties: ${error.message}`);
        } else {
          message.error('Failed to load property statistics');
        }
        console.error('Properties fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [message]);

  return (
    <DashboardLayout userRole={role as UserRole} userName="Admin User">
      <div style={{ marginBottom: designTokens.spacing.xl }}>
        <Title level={2} style={{ margin: 0, color: designTokens.colors.text }}>
          Properties Management
        </Title>
        <p
          style={{
            color: designTokens.colors.muted,
            marginTop: designTokens.spacing.sm,
          }}
        >
          Manage all properties, listings, and verifications
        </p>
      </div>

      {loading && !stats ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: designTokens.spacing.xl }}>
            <Col xs={24} sm={12} lg={6}>
              <Card variant="borderless" style={{ boxShadow: designTokens.shadows.base }}>
                <Statistic
                  title="Total Properties"
                  value={stats?.total || 0}
                  prefix={<HomeOutlined />}
                  valueStyle={{ color: designTokens.colors.brand }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card variant="borderless" style={{ boxShadow: designTokens.shadows.base }}>
                <Statistic
                  title="Available"
                  value={stats?.available || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: designTokens.colors.success }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card variant="borderless" style={{ boxShadow: designTokens.shadows.base }}>
                <Statistic
                  title="Rented"
                  value={stats?.rented || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: designTokens.colors.info }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card variant="borderless" style={{ boxShadow: designTokens.shadows.base }}>
                <Statistic
                  title="Total Value"
                  value={stats?.totalValue || 0}
                  prefix="₦"
                  suffix={<DollarOutlined />}
                  valueStyle={{ color: designTokens.colors.accent }}
                  formatter={(value) => `${Number(value).toLocaleString()}`}
                />
              </Card>
            </Col>
          </Row>

          {/* Properties Table */}
          <div style={{ marginTop: designTokens.spacing.xl }}>
            <Title
              level={3}
              style={{
                marginBottom: designTokens.spacing.lg,
                color: designTokens.colors.text,
              }}
            >
              All Properties
            </Title>
            <PropertiesTable
              userRole={role}
              onEdit={(property) => {
                message.info(`Edit property: ${property.title}`);
                // Navigate to edit page or open modal
              }}
              onDelete={(property) => {
                message.warning(`Delete property: ${property.title}`);
                // Show confirmation modal
              }}
              onVerify={async () => {
                try {
                  message.loading('Verifying property...');
                  // await propertiesApi.verifyProperty(property._id);
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

export default function PropertiesPage() {
  return (
    <ConfigProvider theme={antdTheme}>
      <App>
        <PropertiesContent />
      </App>
    </ConfigProvider>
  );
}
