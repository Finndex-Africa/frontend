'use client';

import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Dropdown, Space, Avatar } from 'antd';
import {
    HomeOutlined,
    AppstoreOutlined,
    ShopOutlined,
    TeamOutlined,
    MessageOutlined,
    SettingOutlined,
    LogoutOutlined,
    UserOutlined,
    CalendarOutlined,
    BellOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { designTokens } from '@/config/theme';
import type { UserRole } from '@/types/dashboard';

const { Sider, Header, Content } = AntLayout;

interface DashboardLayoutProps {
    children: React.ReactNode;
    userRole?: UserRole;
    userName?: string;
}

export function DashboardLayout({ children, userRole, userName }: DashboardLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleMenuClick = (key: string) => {
        if (key === 'logout') {
            handleLogout();
        } else {
            router.push(`/${key}`);
        }
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: 'Profile',
            icon: <UserOutlined />,
            onClick: () => handleMenuClick('profile'),
        },
        {
            key: 'settings',
            label: 'Settings',
            icon: <SettingOutlined />,
            onClick: () => handleMenuClick('settings'),
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined />,
            onClick: () => handleLogout(),
            danger: true,
        },
    ];

    const menuItems = [
        {
            key: '/dashboard',
            icon: <HomeOutlined />,
            label: 'Overview',
        },
        {
            key: '/routes/properties',
            icon: <AppstoreOutlined />,
            label: 'Properties',
        },
        {
            key: '/routes/services',
            icon: <ShopOutlined />,
            label: 'Services',
        },
        {
            key: '/bookings',
            icon: <CalendarOutlined />,
            label: 'Bookings',
        },
        {
            key: '/users',
            icon: <TeamOutlined />,
            label: 'Users',
        },
        {
            key: '/notifications',
            icon: <BellOutlined />,
            label: 'Notifications',
        },
        {
            key: '/messages',
            icon: <MessageOutlined />,
            label: 'Messages',
        },
        {
            key: '/settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
    ];

    const handleLogout = () => {
        localStorage.clear();
        document.cookie = 'token=; path=/; max-age=0';
        window.location.href = `${process.env.NEXT_PUBLIC_WEBSITE_URL || '/'}/`;
    };

    return (
        <AntLayout>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    backgroundColor: '#fff',
                    borderRight: '1px solid #f0f0f0',
                }}
                theme="light"
            >
                <div className="h-16 flex items-center justify-center border-b border-gray-100 px-4">
                    {collapsed ? (
                        <div style={{ fontWeight: 'bold', fontSize: '18px' }}>F</div>
                    ) : (
                        <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Finndex</div>
                    )}
                </div>
                <Menu
                    theme="light"
                    selectedKeys={[pathname]}
                    mode="inline"
                    items={menuItems}
                    onClick={({ key }) => router.push(key)}
                    style={{
                        height: 'calc(100vh - 64px)',
                        borderRight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                />
            </Sider>
            <AntLayout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
                <Header
                    style={{
                        padding: '16px 32px',
                        background: '#fff',
                        boxShadow: designTokens.shadows.base,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        height: '72px',
                    }}
                >
                    <Dropdown menu={{ items: userMenuItems }}>
                        <Space className="cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-all">
                            <Avatar
                                icon={<UserOutlined />}
                                size={40}
                                style={{
                                    backgroundColor: '#6366f1',
                                    border: '2px solid #f0f0f0'
                                }}
                            />
                            <div className="hidden md:block">
                                <div style={{ fontWeight: 600, fontSize: '14px', lineHeight: '18px' }}>
                                    {userName || 'User'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#888', lineHeight: '16px' }}>
                                    {userRole || 'Admin'}
                                </div>
                            </div>
                        </Space>
                    </Dropdown>
                </Header>
                <Content style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 72px)' }}>
                    {children}
                </Content>
            </AntLayout>
        </AntLayout>
    );
}
