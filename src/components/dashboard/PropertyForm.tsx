'use client';

import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, Button, Alert, Space, Card } from 'antd';
import type { FormProps } from 'antd';
import { isApiError } from '@/services/api';
import { designTokens } from '@/config/theme';

const { Option } = Select;
const { TextArea } = Input;

interface PropertyFormValues {
  title: string;
  type: string;
  price: number;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  status: string;
}

interface PropertyFormProps {
  initialValues?: Partial<PropertyFormValues>;
  onSubmit: (values: PropertyFormValues) => Promise<void>;
  loading?: boolean;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  initialValues,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit: FormProps<PropertyFormValues>['onFinish'] = async (values) => {
    setServerError(null);
    setFieldErrors({});

    try {
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      if (isApiError(error)) {
        setServerError(error.message);

        // Map server field errors to form fields
        if (error.errors && error.errors.length > 0) {
          const errors: Record<string, string> = {};
          error.errors.forEach((err) => {
            errors[err.field] = err.message;
          });
          setFieldErrors(errors);

          // Set form field errors
          const formErrors = error.errors.map((err) => ({
            name: err.field,
            errors: [err.message],
          }));
          form.setFields(formErrors);
        }
      } else {
        setServerError('An unexpected error occurred');
      }
    }
  };

  return (
    <Card
      variant="borderless"
      style={{
        boxShadow: designTokens.shadows.base,
        maxWidth: 800,
        margin: '0 auto',
      }}
    >
      {serverError && (
        <Alert
          message="Error"
          description={serverError}
          type="error"
          closable
          onClose={() => setServerError(null)}
          style={{ marginBottom: designTokens.spacing.lg }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        autoComplete="off"
        requiredMark="optional"
      >
        <Form.Item
          label="Property Title"
          name="title"
          rules={[
            { required: true, message: 'Please enter property title' },
            { min: 5, message: 'Title must be at least 5 characters' },
            { max: 100, message: 'Title must not exceed 100 characters' },
          ]}
          validateStatus={fieldErrors.title ? 'error' : ''}
          help={fieldErrors.title}
        >
          <Input
            placeholder="e.g., Modern 3BR Apartment in Lekki"
            size="large"
            aria-label="Property title"
          />
        </Form.Item>

        <Space size="large" style={{ width: '100%', display: 'flex' }}>
          <Form.Item
            label="Property Type"
            name="type"
            rules={[{ required: true, message: 'Please select property type' }]}
            validateStatus={fieldErrors.type ? 'error' : ''}
            help={fieldErrors.type}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Select type"
              size="large"
              aria-label="Property type"
            >
              <Option value="apartment">Apartment</Option>
              <Option value="house">House</Option>
              <Option value="studio">Studio</Option>
              <Option value="office">Office</Option>
              <Option value="land">Land</Option>
              <Option value="commercial">Commercial</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select status' }]}
            validateStatus={fieldErrors.status ? 'error' : ''}
            help={fieldErrors.status}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Select status"
              size="large"
              aria-label="Property status"
            >
              <Option value="available">Available</Option>
              <Option value="rented">Rented</Option>
              <Option value="sold">Sold</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>
        </Space>

        <Form.Item
          label="Price (₦)"
          name="price"
          rules={[
            { required: true, message: 'Please enter price' },
            { type: 'number', min: 0, message: 'Price must be positive' },
          ]}
          validateStatus={fieldErrors.price ? 'error' : ''}
          help={fieldErrors.price}
        >
          <InputNumber
            placeholder="e.g., 5000000"
            size="large"
            style={{ width: '100%' }}
            formatter={(value) => `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value?.replace(/₦\s?|(,*)/g, '') as unknown as number}
            aria-label="Property price"
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: 'Please enter description' },
            { min: 20, message: 'Description must be at least 20 characters' },
            { max: 1000, message: 'Description must not exceed 1000 characters' },
          ]}
          validateStatus={fieldErrors.description ? 'error' : ''}
          help={fieldErrors.description}
        >
          <TextArea
            placeholder="Describe the property features, amenities, and unique selling points..."
            rows={4}
            showCount
            maxLength={1000}
            aria-label="Property description"
          />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[
            { required: true, message: 'Please enter address' },
            { min: 5, message: 'Address must be at least 5 characters' },
          ]}
          validateStatus={fieldErrors.address ? 'error' : ''}
          help={fieldErrors.address}
        >
          <Input
            placeholder="e.g., 123 Admiralty Way"
            size="large"
            aria-label="Property address"
          />
        </Form.Item>

        <Space size="large" style={{ width: '100%', display: 'flex' }}>
          <Form.Item
            label="City"
            name="city"
            rules={[{ required: true, message: 'Please enter city' }]}
            validateStatus={fieldErrors.city ? 'error' : ''}
            help={fieldErrors.city}
            style={{ flex: 1 }}
          >
            <Input placeholder="e.g., Lagos" size="large" aria-label="City" />
          </Form.Item>

          <Form.Item
            label="State"
            name="state"
            rules={[{ required: true, message: 'Please enter state' }]}
            validateStatus={fieldErrors.state ? 'error' : ''}
            help={fieldErrors.state}
            style={{ flex: 1 }}
          >
            <Input placeholder="e.g., Lagos State" size="large" aria-label="State" />
          </Form.Item>

          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: 'Please enter country' }]}
            validateStatus={fieldErrors.country ? 'error' : ''}
            help={fieldErrors.country}
            style={{ flex: 1 }}
          >
            <Input placeholder="e.g., Nigeria" size="large" aria-label="Country" />
          </Form.Item>
        </Space>

        <Space size="large" style={{ width: '100%', display: 'flex' }}>
          <Form.Item
            label="Bedrooms"
            name="bedrooms"
            validateStatus={fieldErrors.bedrooms ? 'error' : ''}
            help={fieldErrors.bedrooms}
            style={{ flex: 1 }}
          >
            <InputNumber
              placeholder="0"
              size="large"
              min={0}
              max={20}
              style={{ width: '100%' }}
              aria-label="Number of bedrooms"
            />
          </Form.Item>

          <Form.Item
            label="Bathrooms"
            name="bathrooms"
            validateStatus={fieldErrors.bathrooms ? 'error' : ''}
            help={fieldErrors.bathrooms}
            style={{ flex: 1 }}
          >
            <InputNumber
              placeholder="0"
              size="large"
              min={0}
              max={20}
              style={{ width: '100%' }}
              aria-label="Number of bathrooms"
            />
          </Form.Item>

          <Form.Item
            label="Area (sqm)"
            name="area"
            validateStatus={fieldErrors.area ? 'error' : ''}
            help={fieldErrors.area}
            style={{ flex: 1 }}
          >
            <InputNumber
              placeholder="0"
              size="large"
              min={0}
              style={{ width: '100%' }}
              aria-label="Property area in square meters"
            />
          </Form.Item>
        </Space>

        <Form.Item style={{ marginBottom: 0, marginTop: designTokens.spacing.xl }}>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{
                backgroundColor: designTokens.colors.brand,
              }}
            >
              {initialValues ? 'Update Property' : 'Create Property'}
            </Button>
            <Button
              htmlType="reset"
              size="large"
              onClick={() => {
                form.resetFields();
                setServerError(null);
                setFieldErrors({});
              }}
            >
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};
