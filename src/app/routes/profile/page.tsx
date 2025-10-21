'use client';

import React, { useState, useEffect } from 'react';
import {
  ConfigProvider,
  App,
  Card,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  Spin,
  Divider,
  Tag,
  Descriptions,
  Space,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import type { UserRole } from '@/types/dashboard';
import { authApi, isApiError } from '@/services/api';
import { antdTheme, designTokens } from '@/config/theme';
import { useAuth } from '@/providers';

const { Title, Text } = Typography;

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
  verified: boolean;
  avatar?: string;
  status: string;
  lastActive?: string;
  createdAt: string;
  agentDetails?: {
    landlordId: string;
    commission: number;
    verified: boolean;
  };
}

function ProfileContent() {
  const { role, setRole } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Set role to admin for dashboard access
  useEffect(() => {
    setRole('admin');
  }, [setRole]);

  // Fetch user profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Fetch current user profile from API
        const response = await authApi.getMe();
        const userData = (response as any).data || response;

        const userProfile: UserProfile = {
          _id: userData._id,
          name: userData.name || 'N/A',
          email: userData.email,
          phone: userData.phone || '',
          userType: userData.userType || 'guest',
          verified: userData.verified || false,
          avatar: userData.avatar,
          status: userData.status || 'active',
          lastActive: userData.lastActive,
          createdAt: userData.createdAt,
          agentDetails: userData.agentDetails,
        };

        setProfile(userProfile);
        form.setFieldsValue({
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
        });
      } catch (error) {
        if (isApiError(error)) {
          message.error(`Failed to load profile: ${error.message}`);
        } else {
          message.error('Failed to load profile');
        }
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [message, form]);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      // Prepare update data
      const updateData: any = {
        name: values.name,
        phone: values.phone,
      };

      // Add password fields if provided
      if (values.currentPassword && values.newPassword) {
        updateData.currentPassword = values.currentPassword;
        updateData.newPassword = values.newPassword;
      }

      // Call API to update profile
      const response = await authApi.updateProfile(updateData);
      const updatedUser = (response as any).data || response;

      // Update local state with response
      setProfile((prev) => prev ? {
        ...prev,
        name: updatedUser.name || prev.name,
        phone: updatedUser.phone || prev.phone,
      } : null);

      message.success('Profile updated successfully');
      setEditMode(false);

      // Clear password fields
      form.setFieldsValue({
        currentPassword: undefined,
        newPassword: undefined,
      });
    } catch (error) {
      if (isApiError(error)) {
        message.error(`Failed to update profile: ${error.message}`);
      } else {
        message.error('Failed to update profile');
      }
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarChange = (info: any) => {
    setFileList(info.fileList.slice(-1));

    if (info.file.status === 'done') {
      message.success('Avatar uploaded successfully');
      // TODO: Update profile with new avatar URL
    } else if (info.file.status === 'error') {
      message.error('Avatar upload failed');
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    form.resetFields();
    setEditMode(false);
  };

  if (loading || !profile) {
    return (
      <DashboardLayout userRole={role as UserRole} userName="Admin User">
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={role as UserRole} userName={profile.name}>
      <div style={{ marginBottom: designTokens.spacing.xl }}>
        <Title level={2} style={{ margin: 0, color: designTokens.colors.text }}>
          Profile
        </Title>
        <Text style={{ color: designTokens.colors.muted }}>
          Manage your personal information and account settings
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card
            variant="borderless"
            style={{ boxShadow: designTokens.shadows.base, height: '100%' }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: designTokens.spacing.lg }}>
                <Avatar
                  size={120}
                  icon={<UserOutlined />}
                  src={profile.avatar}
                  style={{ backgroundColor: designTokens.colors.brand }}
                />
                {editMode && (
                  <Upload
                    showUploadList={false}
                    onChange={handleAvatarChange}
                    fileList={fileList}
                  >
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<CameraOutlined />}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                      }}
                    />
                  </Upload>
                )}
              </div>

              <Title level={4} style={{ margin: 0, marginBottom: designTokens.spacing.xs }}>
                {profile.name}
              </Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: designTokens.spacing.sm }}>
                {profile.email}
              </Text>

              <Space>
                <Tag
                  color={profile.verified ? designTokens.colors.success : designTokens.colors.warning}
                  icon={profile.verified ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                >
                  {profile.verified ? 'Verified' : 'Not Verified'}
                </Tag>
                <Tag color={designTokens.colors.brand} style={{ textTransform: 'capitalize' }}>
                  {profile.userType.replace('_', ' ')}
                </Tag>
              </Space>

              <Divider />

              <Descriptions column={1} size="small">
                <Descriptions.Item label="Status">
                  <Tag color={profile.status === 'active' ? designTokens.colors.success : designTokens.colors.muted}>
                    {profile.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Member Since">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Descriptions.Item>
                {profile.lastActive && (
                  <Descriptions.Item label="Last Active">
                    {new Date(profile.lastActive).toLocaleDateString()}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          </Card>
        </Col>

        {/* Profile Information Card */}
        <Col xs={24} lg={16}>
          <Card
            variant="borderless"
            style={{ boxShadow: designTokens.shadows.base }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Personal Information</span>
                {!editMode ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Space>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={() => form.submit()}
                      loading={saving}
                    >
                      Save Changes
                    </Button>
                  </Space>
                )}
              </div>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              disabled={!editMode}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Full Name"
                    name="name"
                    rules={[
                      { required: true, message: 'Please enter your name' },
                      { min: 2, message: 'Name must be at least 2 characters' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: designTokens.colors.muted }} />}
                      placeholder="Enter your full name"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined style={{ color: designTokens.colors.muted }} />}
                      placeholder="Enter your email"
                      size="large"
                      disabled
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Phone Number"
                    name="phone"
                    rules={[
                      { required: true, message: 'Please enter your phone number' },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined style={{ color: designTokens.colors.muted }} />}
                      placeholder="Enter your phone number"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Account Type">
                    <Input
                      value={profile.userType.replace('_', ' ').toUpperCase()}
                      size="large"
                      disabled
                      style={{ textTransform: 'capitalize' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {editMode && (
                <Divider />
              )}

              {editMode && (
                <>
                  <Title level={5} style={{ marginBottom: designTokens.spacing.md }}>
                    Change Password
                  </Title>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Current Password"
                        name="currentPassword"
                      >
                        <Input.Password
                          placeholder="Enter current password"
                          size="large"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[
                          { min: 6, message: 'Password must be at least 6 characters' },
                        ]}
                      >
                        <Input.Password
                          placeholder="Enter new password"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}
            </Form>

            {profile.agentDetails && (
              <>
                <Divider />
                <Title level={5} style={{ marginBottom: designTokens.spacing.md }}>
                  Agent Details
                </Title>
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                  <Descriptions.Item label="Commission Rate">
                    {profile.agentDetails.commission}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Agent Verified">
                    <Tag color={profile.agentDetails.verified ? designTokens.colors.success : designTokens.colors.warning}>
                      {profile.agentDetails.verified ? 'Yes' : 'No'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
}

export default function ProfilePage() {
  return (
    <ConfigProvider theme={antdTheme}>
      <App>
        <ProfileContent />
      </App>
    </ConfigProvider>
  );
}
