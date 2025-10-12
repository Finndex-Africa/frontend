// User Types
export enum UserRole {
  GUEST = 'guest',
  HOME_SEEKER = 'home_seeker',
  LANDLORD = 'landlord',
  AGENT = 'agent',
  SERVICE_PROVIDER = 'service_provider',
  ADMIN = 'admin',
}

export interface User {
  _id: string;
  email: string;
  name?: string;
  phone: string;
  userType: UserRole;
  verified: boolean;
  avatar?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Property Types
export interface Property {
  _id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  priceUnit: string;
  images: string[];
  videos: string[];
  amenities: Array<{ icon: string; label: string; description?: string }>;
  rating: number;
  reviewCount: number;
  status: string;
  isPremium: boolean;
  propertyType: string;
  rooms: number;
  furnished: boolean;
  landlordId: User;
  agentId?: User;
  views: number;
  inquiries: number;
  createdAt: string;
  updatedAt: string;
}

// Service Types
export interface Service {
  _id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  rating: number;
  reviewCount: number;
  images: string[];
  tags: string[];
  badge?: string;
  price: number;
  priceUnit: string;
  duration?: string;
  included: string[];
  availability?: string;
  providerId: User;
  status: string;
  views: number;
  bookings: number;
  createdAt: string;
  updatedAt: string;
}

// Booking Types
export interface Booking {
  _id: string;
  serviceId: Service;
  userId: User;
  providerId: User;
  scheduledDate: string;
  duration: number;
  notes?: string;
  contactPhone: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface Review {
  _id: string;
  userId: User;
  itemType: string;
  itemId: string;
  rating: number;
  text: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

// Message Types
export interface MessageThread {
  _id: string;
  participants: User[];
  relatedItem?: {
    type: string;
    id: string;
    title: string;
  };
  lastMessage?: {
    text: string;
    timestamp: string;
    from: string;
  };
  unreadCount: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  threadId: string;
  from: User;
  text: string;
  attachments: string[];
  readBy: string[];
  timestamp: string;
  createdAt: string;
}

// Pagination
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Dashboard Stats
export interface DashboardStats {
  savedProperties?: number;
  savedServices?: number;
  activeListings?: number;
  unreadMessages?: number;
  bookings?: number;
  revenue?: number;
  totalUsers?: number;
  totalProperties?: number;
  totalServiceProviders?: number;
  pendingVerifications?: number;
}
