/**
 * Dashboard Type Definitions
 */

export type UserRole = 'guest' | 'home_seeker' | 'landlord' | 'agent' | 'service_provider' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: UserRole;
  avatar?: string;
  verified: boolean;
  status: 'active' | 'suspended' | 'pending';
  lastActive?: Date;
}

export interface KPIData {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  suffix?: string;
  prefix?: string;
}

export interface Property {
  _id: string;
  title: string;
  type: 'apartment' | 'house' | 'studio' | 'office' | 'land' | 'commercial';
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  status: 'available' | 'rented' | 'sold' | 'pending';
  landlord: {
    _id: string;
    name: string;
    email: string;
  };
  agent?: {
    _id: string;
    name: string;
    email: string;
  };
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PropertiesResponse {
  data: Property[];
  meta: PaginationMeta;
}

export interface PropertiesQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  type?: string;
  status?: string;
  verified?: boolean;
}

export interface ChartDataPoint {
  date: string;
  count: number;
  label?: string;
}

export interface PropertyTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  totalProperties: number;
  totalSales: number;
  commission: number;
  rating: number;
}

export interface DashboardStats {
  totalProperties: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  propertiesOverTime: ChartDataPoint[];
  propertyTypeDistribution: PropertyTypeDistribution[];
  agentPerformance: AgentPerformance[];
}

export interface FormError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: FormError[];
  statusCode?: number;
}

export interface SidebarMenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
  children?: SidebarMenuItem[];
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
}
