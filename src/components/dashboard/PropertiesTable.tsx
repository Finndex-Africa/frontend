'use client';

import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Space, Button, Tag, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { Property, PropertiesQueryParams } from '@/types/dashboard';
import { propertiesApi, isApiError } from '@/services/api';
import { designTokens } from '@/config/theme';

const { Search } = Input;
const { Option } = Select;

interface PropertiesTableProps {
  userRole?: string;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  onVerify?: (property: Property) => void;
}

export const PropertiesTable: React.FC<PropertiesTableProps> = ({
  userRole,
  onEdit,
  onDelete,
  onVerify,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Property[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<PropertiesQueryParams>({
    search: '',
    type: undefined,
    status: undefined,
    verified: undefined,
  });

  const fetchProperties = async (params: PropertiesQueryParams) => {
    setLoading(true);
    try {
      const response = await propertiesApi.getProperties({
        ...params,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setData(response.data);
      setPagination({
        current: response.meta.page,
        pageSize: response.meta.limit,
        total: response.meta.total,
      });
    } catch (error) {
      if (isApiError(error)) {
        message.error(error.message);
      } else {
        message.error('Failed to load properties');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const handleTableChange: TableProps<Property>['onChange'] = (newPagination, _, sorter) => {
    setPagination({
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
      total: pagination.total,
    });

    // Handle sorting
    if (!Array.isArray(sorter) && sorter.order) {
      const sortField = sorter.field as string;
      const sortOrder = sorter.order === 'ascend' ? '' : '-';
      setFilters({ ...filters, sort: `${sortOrder}${sortField}` });
    }
  };

  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, current: 1 });
    fetchProperties({ ...filters, search: value });
  };

  const handleFilterChange = (key: keyof PropertiesQueryParams, value: string | number | boolean | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination({ ...pagination, current: 1 });
    fetchProperties(newFilters);
  };

  const handleRefresh = () => {
    fetchProperties(filters);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: designTokens.colors.success,
      rented: designTokens.colors.info,
      sold: designTokens.colors.muted,
      pending: designTokens.colors.warning,
    };
    return colors[status] || designTokens.colors.muted;
  };

  const columns: TableProps<Property>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      ellipsis: true,
      sorter: true,
      render: (text) => (
        <span style={{ fontWeight: designTokens.fontWeight.medium }}>{text}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag
          color={designTokens.colors.brand}
          style={{ textTransform: 'capitalize', border: 'none' }}
        >
          {type}
        </Tag>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      sorter: true,
      render: (price) => (
        <span style={{ fontWeight: designTokens.fontWeight.semibold }}>
          ₦{price.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <span style={{ color: designTokens.colors.muted }}>
          {record.location?.city && record.location?.state
            ? `${record.location.city}, ${record.location.state}`
            : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          style={{ textTransform: 'capitalize', border: 'none' }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Landlord',
      key: 'landlord',
      width: 150,
      ellipsis: true,
      render: (_, record) => record.landlord?.name || 'N/A',
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
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  // Add actions column for admin/manager roles
  if (userRole === 'admin' || userRole === 'agent') {
    columns.push({
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          {onEdit && (
            <Button
              type="link"
              size="small"
              onClick={() => onEdit(record)}
              style={{ padding: 0 }}
            >
              Edit
            </Button>
          )}
          {onVerify && !record.verified && userRole === 'admin' && (
            <Button
              type="link"
              size="small"
              onClick={() => onVerify(record)}
              style={{ padding: 0, color: designTokens.colors.success }}
            >
              Verify
            </Button>
          )}
          {onDelete && userRole === 'admin' && (
            <Button
              type="link"
              danger
              size="small"
              onClick={() => onDelete(record)}
              style={{ padding: 0 }}
            >
              Delete
            </Button>
          )}
        </Space>
      ),
    });
  }

  return (
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
            placeholder="Search properties..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<SearchOutlined style={{ color: designTokens.colors.muted }} />}
          />

          <Select
            placeholder="Type"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('type', value)}
          >
            <Option value="apartment">Apartment</Option>
            <Option value="house">House</Option>
            <Option value="studio">Studio</Option>
            <Option value="office">Office</Option>
            <Option value="land">Land</Option>
            <Option value="commercial">Commercial</Option>
          </Select>

          <Select
            placeholder="Status"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('status', value)}
          >
            <Option value="available">Available</Option>
            <Option value="rented">Rented</Option>
            <Option value="sold">Sold</Option>
            <Option value="pending">Pending</Option>
          </Select>

          {userRole === 'admin' && (
            <Select
              placeholder="Verified"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange('verified', value)}
            >
              <Option value={true}>Verified</Option>
              <Option value={false}>Not Verified</Option>
            </Select>
          )}
        </Space>

        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
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
          showTotal: (total) => `Total ${total} properties`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
        style={{
          backgroundColor: designTokens.colors.white,
          boxShadow: designTokens.shadows.base,
        }}
      />
    </div>
  );
};
