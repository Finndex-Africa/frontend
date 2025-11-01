'use client';

import React, { useState, useEffect } from 'react';
import { ConfigProvider, App, Row, Col, Typography, Spin, Card, Statistic, Table, Input, Select, Space, Button, Tag } from 'antd';
import {
  ShopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import type { UserRole } from '@/types/dashboard';
import type { TableProps } from 'antd';
import { servicesApi, isApiError } from '@/services/api';
import { antdTheme, designTokens } from '@/config/theme';
import { useAuth } from '@/providers';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface ServiceStats {
  total: number;
  active: number;
  pending: number;
  totalRevenue: number;
}

interface Service {
  _id: string;
  title: string;
  category: string;
  provider: {
    name: string;
  };
  price: number;
  status: 'active' | 'pending' | 'inactive';
  rating: number;
  bookings: number;
  createdAt: string;
}

function ServicesContent() {
  const { role, setRole } = useAuth();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [data, setData] = useState<Service[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Set role to admin for dashboard access (temporary - replace with actual auth)
  useEffect(() => {
    setRole('admin');
  }, [setRole]);

  // Fetch service statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch services from API
        const response = await servicesApi.getAll({ limit: 1000 });
        const services = response.data?.data || [];

        // Calculate statistics from actual data
        const total = services.length;
        const active = services.filter((s: any) => s.status === 'active').length;
        const pending = services.filter((s: any) => s.status === 'pending').length;
        const totalRevenue = services.reduce((sum: number, s: any) => {
          return sum + (s.price || 0) * (s.bookings || 0);
        }, 0);

        setStats({
          total,
          active,
          pending,
          totalRevenue,
        });

        // Set table data (first page)
        setData(services.slice(0, pagination.pageSize) as any);
        setPagination((prev) => ({ ...prev, total }));
      } catch (error) {
        if (isApiError(error)) {
          message.error(`Failed to load services: ${error.message}`);
        } else {
          message.error('Failed to load service statistics');
        }
        console.error('Services fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [message, pagination.pageSize]);

  const columns: TableProps<Service>['columns'] = [
    {
      title: 'Service',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      ellipsis: true,
      render: (text) => (
        <span style={{ fontWeight: designTokens.fontWeights.medium }}>{text}</span>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
    },
    {
      title: 'Provider',
      key: 'provider',
      width: 180,
      render: (_, record) => record.provider?.name || 'N/A',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => (
        <span style={{ fontWeight: designTokens.fontWeights.semibold }}>
          ₦{price.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors: Record<string, string> = {
          active: designTokens.colors.success,
          pending: designTokens.colors.warning,
          inactive: designTokens.colors.muted,
        };
        return (
          <Tag
            color={colors[status]}
            style={{ textTransform: 'capitalize', border: 'none' }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating) => `⭐ ${rating}`,
    },
    {
      title: 'Bookings',
      dataIndex: 'bookings',
      key: 'bookings',
      width: 100,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <DashboardLayout userRole={role as UserRole} userName="Admin User">
      <div style={{ marginBottom: designTokens.spacing.xl }}>
        <Title level={2} style={{ margin: 0, color: designTokens.colors.text }}>
          Services Management
        </Title>
        <p
          style={{
            color: designTokens.colors.muted,
            marginTop: designTokens.spacing.sm,
          }}
        >
          Manage all services and service providers
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
                  title="Total Services"
                  value={stats?.total || 0}
                  prefix={<ShopOutlined />}
                  valueStyle={{ color: designTokens.colors.brand }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card variant="borderless" style={{ boxShadow: designTokens.shadows.base }}>
                <Statistic
                  title="Active"
                  value={stats?.active || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: designTokens.colors.success }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card variant="borderless" style={{ boxShadow: designTokens.shadows.base }}>
                <Statistic
                  title="Pending"
                  value={stats?.pending || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: designTokens.colors.warning }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card variant="borderless" style={{ boxShadow: designTokens.shadows.base }}>
                <Statistic
                  title="Total Revenue"
                  value={stats?.totalRevenue || 0}
                  prefix="₦"
                  suffix={<DollarOutlined />}
                  valueStyle={{ color: designTokens.colors.accent }}
                  formatter={(value) => `${Number(value).toLocaleString()}`}
                />
              </Card>
            </Col>
          </Row>

          {/* Services Table */}
          <div style={{ marginTop: designTokens.spacing.xl }}>
            <Title
              level={3}
              style={{
                marginBottom: designTokens.spacing.lg,
                color: designTokens.colors.text,
              }}
            >
              All Services
            </Title>

            <div>
              <Space
                style={{
                  marginBottom: designTokens.spacing.lg,
                  width: '100%',
                  justifyContent: 'space-between',
                }}
                wrap
              >
                <Space wrap>
                  <Search
                    placeholder="Search services..."
                    allowClear
                    style={{ width: 300 }}
                    prefix={<SearchOutlined style={{ color: designTokens.colors.muted }} />}
                  />

                  <Select placeholder="Category" allowClear style={{ width: 150 }}>
                    <Option value="cleaning">Cleaning</Option>
                    <Option value="maintenance">Maintenance</Option>
                    <Option value="moving">Moving</Option>
                    <Option value="security">Security</Option>
                  </Select>

                  <Select placeholder="Status" allowClear style={{ width: 150 }}>
                    <Option value="active">Active</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
                </Space>

                <Button icon={<ReloadOutlined />} loading={loading}>
                  Refresh
                </Button>
              </Space>

              <Table
                columns={columns}
                dataSource={data}
                rowKey="_id"
                loading={loading}
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} services`,
                  pageSizeOptions: ['10', '20', '50', '100'],
                }}
                scroll={{ x: 1200 }}
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: designTokens.shadows.base,
                }}
              />
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default function ServicesPage() {
  return (
    <ConfigProvider theme={antdTheme}>
      <App>
        <ServicesContent />
      </App>
    </ConfigProvider>
  );
}
