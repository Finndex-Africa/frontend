'use client';

import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Button } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import type { MenuProps } from 'antd';
import type { UserRole } from '@/types/dashboard';
import { navigationMenu, filterMenuByRole } from '@/config/navigation';
import { designTokens } from '@/config/theme';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  userName?: string;
  userAvatar?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userRole,
  userName = 'User',
  userAvatar,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Filter menu items based on user role
  const filteredMenu = filterMenuByRole(navigationMenu, userRole);

  // Convert menu items to Ant Design Menu format
  const menuItems: MenuProps['items'] = filteredMenu.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    children: item.children?.map((child) => ({
      key: child.key,
      icon: child.icon,
      label: child.label,
    })),
  }));

  // Handle menu click
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    // Find the menu item and navigate to its path
    const findItemPath = (items: typeof navigationMenu, searchKey: string): string | null => {
      for (const item of items) {
        if (item.key === searchKey) return item.path;
        if (item.children) {
          const childPath = findItemPath(item.children, searchKey);
          if (childPath) return childPath;
        }
      }
      return null;
    };

    const path = findItemPath(filteredMenu, key);
    if (path) router.push(path);
  };

  // Get current selected key from pathname
  const getSelectedKey = () => {
    const findKey = (items: typeof navigationMenu): string | null => {
      for (const item of items) {
        if (pathname.startsWith(item.path)) return item.key;
        if (item.children) {
          const childKey = findKey(item.children);
          if (childKey) return childKey;
        }
      }
      return null;
    };
    return findKey(filteredMenu) || 'dashboard';
  };

  // User menu dropdown
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => router.push('/routes/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => router.push('/routes/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        // Clear auth token
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        router.push('/routes/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) setCollapsed(true);
        }}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          backgroundColor: designTokens.colors.white,
          borderRight: `1px solid ${designTokens.colors.gray200}`,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${designTokens.colors.gray200}`,
            padding: designTokens.spacing.md,
          }}
        >
          {!collapsed ? (
            <Text
              strong
              style={{
                fontSize: designTokens.fontSize.xl,
                color: designTokens.colors.brand,
              }}
            >
              Finndex
            </Text>
          ) : (
            <Text
              strong
              style={{
                fontSize: designTokens.fontSize.xl,
                color: designTokens.colors.brand,
              }}
            >
              F
            </Text>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            border: 'none',
            marginTop: designTokens.spacing.md,
          }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: designTokens.colors.white,
            borderBottom: `1px solid ${designTokens.colors.gray200}`,
            padding: `0 ${designTokens.spacing.xl}`,
            boxShadow: designTokens.shadows.sm,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 48,
              height: 48,
            }}
          />

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.sm,
                cursor: 'pointer',
              }}
            >
              <Avatar
                src={userAvatar}
                icon={!userAvatar && <UserOutlined />}
                style={{
                  backgroundColor: designTokens.colors.brand,
                }}
              />
              <div>
                <Text strong style={{ display: 'block' }}>
                  {userName}
                </Text>
                <Text
                  type="secondary"
                  style={{
                    fontSize: designTokens.fontSize.xs,
                    textTransform: 'capitalize',
                  }}
                >
                  {userRole.replace('_', ' ')}
                </Text>
              </div>
            </div>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: designTokens.spacing.xl,
            padding: designTokens.spacing.xl,
            minHeight: 280,
            backgroundColor: designTokens.colors.background,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
