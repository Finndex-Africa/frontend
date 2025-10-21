import React from 'react';
import {
  DashboardOutlined,
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ShopOutlined,
  MessageOutlined,
  BellOutlined,
} from '@ant-design/icons';
import type { SidebarMenuItem, UserRole } from '@/types/dashboard';

/**
 * Navigation menu items with role-based access control
 * Only items with roles matching the user's role will be displayed
 */
export const navigationMenu: SidebarMenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardOutlined />,
    path: '/routes/management-dashboard',
    roles: ['admin', 'agent', 'landlord', 'service_provider', 'home_seeker'],
  },
  {
    key: 'properties',
    label: 'Properties',
    icon: <HomeOutlined />,
    path: '/routes/properties',
    roles: ['admin', 'agent', 'landlord'],
    children: [
      {
        key: 'all-properties',
        label: 'All Properties',
        icon: <FileTextOutlined />,
        path: '/routes/properties',
        roles: ['admin', 'agent', 'landlord'],
      },
      {
        key: 'add-property',
        label: 'Add Property',
        icon: <HomeOutlined />,
        path: '/routes/landlord/new',
        roles: ['landlord', 'admin'],
      },
      {
        key: 'verify-properties',
        label: 'Verify Properties',
        icon: <CheckCircleOutlined />,
        path: '/routes/management-dashboard/verify-properties',
        roles: ['admin'],
      },
    ],
  },
  {
    key: 'services',
    label: 'Services',
    icon: <ShopOutlined />,
    path: '/routes/services',
    roles: ['admin', 'service_provider'],
    children: [
      {
        key: 'all-services',
        label: 'All Services',
        icon: <FileTextOutlined />,
        path: '/routes/services',
        roles: ['admin', 'service_provider'],
      },
      {
        key: 'add-service',
        label: 'Add Service',
        icon: <ShopOutlined />,
        path: '/routes/provider/onboarding',
        roles: ['service_provider', 'admin'],
      },
    ],
  },
  {
    key: 'users',
    label: 'Users',
    icon: <TeamOutlined />,
    path: '/routes/management-dashboard/users',
    roles: ['admin'],
  },
  {
    key: 'messages',
    label: 'Messages',
    icon: <MessageOutlined />,
    path: '/routes/messages',
    roles: ['admin', 'agent', 'landlord', 'service_provider'],
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: <BellOutlined />,
    path: '/routes/notifications',
    roles: ['admin', 'agent', 'landlord', 'service_provider', 'home_seeker'],
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: <UserOutlined />,
    path: '/routes/profile',
    roles: ['admin', 'agent', 'landlord', 'service_provider', 'home_seeker'],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingOutlined />,
    path: '/routes/settings',
    roles: ['admin'],
  },
];

/**
 * Filter menu items based on user role
 */
export const filterMenuByRole = (
  menu: SidebarMenuItem[],
  userRole: UserRole
): SidebarMenuItem[] => {
  return menu
    .filter((item) => item.roles.includes(userRole))
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: filterMenuByRole(item.children, userRole),
        };
      }
      return item;
    })
    .filter((item) => !item.children || item.children.length > 0);
};

/**
 * Get default route for user role
 */
export const getDefaultRoute = (userRole: UserRole): string => {
  const roleRoutes: Record<UserRole, string> = {
    admin: '/routes/management-dashboard',
    agent: '/routes/management-dashboard',
    landlord: '/routes/dashboard',
    service_provider: '/routes/dashboard',
    home_seeker: '/routes/dashboard',
    guest: '/routes/home',
  };

  return roleRoutes[userRole] || '/routes/home';
};
