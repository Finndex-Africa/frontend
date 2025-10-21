'use client';

import React, { useState, useEffect } from 'react';
import { ConfigProvider, App, Row, Col, Typography, Spin, Card, Statistic, Table, Input, Select, Space, Button, Tag, Avatar } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import type { UserRole } from '@/types/dashboard';
import type { TableProps } from 'antd';
import { usersApi, isApiError } from '@/services/api';
import { antdTheme, designTokens } from '@/config/theme';
import { useAuth } from '@/providers';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface UserStats {
  total: number;
  active: number;
  landlords: number;
  seekers: number;
  providers: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  verified: boolean;
  properties?: number;
  services?: number;
  createdAt: string;
}

function UsersContent() {
  const { role, setRole } = useAuth();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [data, setData] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Set role to admin for dashboard access (temporary - replace with actual auth)
  useEffect(() => {
    setRole('admin');
  }, [setRole]);

  // Fetch user statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch users from API
        const response = await usersApi.getUsers({ limit: 1000 });
        const users = (response as any).data || [];

        // Calculate statistics from actual data
        const total = users.length;
        const active = users.filter((u: any) => u.status === 'active').length;
        const landlords = users.filter((u: any) => u.userType === 'landlord').length;
        const seekers = users.filter((u: any) => u.userType === 'home_seeker').length;
        const providers = users.filter((u: any) => u.userType === 'service_provider').length;

        setStats({
          total,
          active,
          landlords,
          seekers,
          providers,
        });

        // Transform users data for table
        const transformedUsers = users.map((user: any) => ({
          _id: user._id,
          name: user.name || 'N/A',
          email: user.email,
          role: user.userType,
          status: user.status || 'active',
          verified: user.verified || false,
          properties: user.properties?.length || 0,
          services: user.services?.length || 0,
          createdAt: user.createdAt,
        }));

        setData(transformedUsers.slice(0, pagination.pageSize));
        setPagination((prev) => ({ ...prev, total }));
      } catch (error) {
        if (isApiError(error)) {
          message.error(`Failed to load users: ${error.message}`);
        } else {
          message.error('Failed to load user statistics');
        }
        console.error('Users fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [message, pagination.pageSize]);

  const columns: TableProps<User>['columns'] = [
    {
      title: 'User',
      key: 'user',
      width: 250,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: designTokens.colors.brand }} />
          <div>
            <div style={{ fontWeight: designTokens.fontWeight.medium }}>{record.name}</div>
            <div style={{ color: designTokens.colors.muted, fontSize: designTokens.fontSize.sm }}>
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => (
        <Tag color={designTokens.colors.brand} style={{ textTransform: 'capitalize' }}>
          {role}
        </Tag>
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
          inactive: designTokens.colors.muted,
          suspended: designTokens.colors.error,
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
      title: 'Verified',
      dataIndex: 'verified',
      key: 'verified',
      width: 100,
      render: (verified) => (
        <Tag color={verified ? designTokens.colors.success : designTokens.colors.warning}>
          {verified ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Properties',
      dataIndex: 'properties',
      key: 'properties',
      width: 100,
      render: (properties) => properties || '-',
    },
    {
      title: 'Services',
      dataIndex: 'services',
      key: 'services',
      width: 100,
      render: (services) => services || '-',
    },
    {
      title: 'Joined',
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
          Users Management
        </Title>
        <p
          style={{
            color: designTokens.colors.muted,
            marginTop: designTokens.spacing.sm,
          }}
        >
          Manage all users, roles, and permissions
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
            <Col xs={24} sm={12} lg={8}>
              <Card variant="borderless" style={{ boxShadow: designTokens.shadows.base }}>
                <Statistic
                  title="Total Users"
                  value={stats?.total || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: designTokens.colors.brand }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card variant="borderless" style={{ boxShadow: designTokens.shadows.base }}>
                <Statistic
                  title="Active Users"
                  value={stats?.active || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: designTokens.colors.success }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card variant="borderless" style={{ boxShadow: designTokens.shadows.base }}>
                <Statistic
                  title="Landlords"
                  value={stats?.landlords || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: designTokens.colors.info }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginBottom: designTokens.spacing.xl }}>
            <Col xs={24} sm={12}>
              <Card variant="borderless" style={{ boxShadow: designTokens.shadows.base }}>
                <Statistic
                  title="Home Seekers"
                  value={stats?.seekers || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: designTokens.colors.accent }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card variant="borderless" style={{ boxShadow: designTokens.shadows.base }}>
                <Statistic
                  title="Service Providers"
                  value={stats?.providers || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: designTokens.colors.warning }}
                />
              </Card>
            </Col>
          </Row>

          {/* Users Table */}
          <div style={{ marginTop: designTokens.spacing.xl }}>
            <Title
              level={3}
              style={{
                marginBottom: designTokens.spacing.lg,
                color: designTokens.colors.text,
              }}
            >
              All Users
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
                    placeholder="Search users..."
                    allowClear
                    style={{ width: 300 }}
                    prefix={<SearchOutlined style={{ color: designTokens.colors.muted }} />}
                  />

                  <Select placeholder="Role" allowClear style={{ width: 150 }}>
                    <Option value="landlord">Landlord</Option>
                    <Option value="seeker">Home Seeker</Option>
                    <Option value="provider">Service Provider</Option>
                    <Option value="admin">Admin</Option>
                  </Select>

                  <Select placeholder="Status" allowClear style={{ width: 150 }}>
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                    <Option value="suspended">Suspended</Option>
                  </Select>

                  <Select placeholder="Verified" allowClear style={{ width: 150 }}>
                    <Option value="true">Verified</Option>
                    <Option value="false">Not Verified</Option>
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
                  showTotal: (total) => `Total ${total} users`,
                  pageSizeOptions: ['10', '20', '50', '100'],
                }}
                scroll={{ x: 1200 }}
                style={{
                  backgroundColor: designTokens.colors.white,
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

export default function UsersPage() {
  return (
    <ConfigProvider theme={antdTheme}>
      <App>
        <UsersContent />
      </App>
    </ConfigProvider>
  );
}
