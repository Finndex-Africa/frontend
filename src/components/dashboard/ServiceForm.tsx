'use client';

import { useState, useEffect } from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import InputNumber from 'antd/es/input-number';
import Select from 'antd/es/select';
import Button from 'antd/es/button';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import Typography from 'antd/es/typography';
import Upload from 'antd/es/upload';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Service } from '@/types/dashboard';
import { showToast } from '@/lib/toast';

const { TextArea } = Input;
const { Text } = Typography;

interface ServiceFormProps {
    initialValues?: Partial<Service>;
    onSubmit: (values: Partial<Service>, files: File[]) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function ServiceForm({
    initialValues,
    onSubmit,
    onCancel,
    loading,
}: ServiceFormProps) {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    // Load existing images when editing
    useEffect(() => {
        if (initialValues?.images && Array.isArray(initialValues.images)) {
            const existingFiles: UploadFile[] = initialValues.images.map((url: string, index: number) => ({
                uid: `-${index}`,
                name: `image-${index}.jpg`,
                status: 'done' as const,
                url: url,
            }));
            setFileList(existingFiles);
        }
    }, [initialValues]);

    const handleSubmit = async (values: any) => {
        console.log('🚀 FRONTEND FORM SUBMIT TRIGGERED!');
        console.log('='.repeat(50));
        console.log('📋 RAW VALUES FROM FORM:', values);
        console.log('🔑 All keys:', Object.keys(values));
        console.log('='.repeat(50));

        // Extract actual File objects from fileList (new uploads only)
        const filesToUpload = fileList
            .filter(file => file.originFileObj)
            .map(file => file.originFileObj as File);

        console.log('📸 Files to upload:', filesToUpload.length);

        // Validate that at least 1 image is uploaded (for create) or exists (for edit)
        const hasNewFiles = filesToUpload.length > 0;
        const hasExistingImages = fileList.some(file => file.url && !file.originFileObj);

        if (!hasNewFiles && !hasExistingImages) {
            showToast.error('Please upload at least 1 image');
            return;
        }

        console.log('🎯 About to call onSubmit (frontend)...');
        // DON'T add existingImages here - let parent handle it!
        onSubmit(values, filesToUpload);
        console.log('✅ onSubmit called!');
    };

    const handleUploadChange = ({ fileList: newFileList }: any) => {
        setFileList(newFileList);
    };

    const beforeUpload = (file: File) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            showToast.error('You can only upload image files!');
        }
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            showToast.error('Image must be smaller than 10MB!');
        }
        return isImage && isLt10M;
    };

    const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            paddingBottom: '12px',
            borderBottom: '2px solid #f3f4f6'
        }}>
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
            }}>
                {icon}
            </div>
            <Text strong style={{ fontSize: '18px', color: '#1f2937', fontWeight: '700' }}>
                {title}
            </Text>
        </div>
    );

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={handleSubmit}
        >
            {/* Basic Information Section */}
            <div style={{ marginBottom: '40px' }}>
                <SectionHeader
                    icon={
                        <svg style={{ width: '22px', height: '22px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    title="Basic Information"
                />
                <Row gutter={[16, 16]}>
                    <Col xs={24}>
                        <Form.Item
                            name="title"
                            label={<span style={{ fontWeight: '600', color: '#374151' }}>Service Name</span>}
                            rules={[{ required: true, message: 'Please enter service name' }]}
                        >
                            <Input
                                size="large"
                                placeholder="e.g., Professional Cleaning Service"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    padding: '12px 16px',
                                    fontSize: '15px'
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="category"
                            label={<span style={{ fontWeight: '600', color: '#374151' }}>Category</span>}
                            rules={[{ required: true, message: 'Please select category' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select category"
                                style={{ borderRadius: '12px' }}
                            >
                                <Select.Option value="electrical">⚡ Electrical</Select.Option>
                                <Select.Option value="plumbing">🔧 Plumbing</Select.Option>
                                <Select.Option value="cleaning">🧹 Cleaning</Select.Option>
                                <Select.Option value="painting_decoration">🎨 Painting & Decoration</Select.Option>
                                <Select.Option value="carpentry_furniture">🪑 Carpentry & Furniture</Select.Option>
                                <Select.Option value="moving_logistics">🚚 Moving & Logistics</Select.Option>
                                <Select.Option value="security_services">🔒 Security Services</Select.Option>
                                <Select.Option value="sanitation_services">♻️ Sanitation Services</Select.Option>
                                <Select.Option value="maintenance">🔨 Maintenance</Select.Option>
                                <Select.Option value="other">📦 Other</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="location"
                            label={<span style={{ fontWeight: '600', color: '#374151' }}>Location</span>}
                            rules={[{ required: true, message: 'Please enter location' }]}
                        >
                            <Input
                                size="large"
                                placeholder="e.g., Paynesville City, Montserrado"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    padding: '12px 16px',
                                    fontSize: '15px'
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </div>

            {/* Pricing Section */}
            <div style={{ marginBottom: '40px' }}>
                <SectionHeader
                    icon={
                        <svg style={{ width: '22px', height: '22px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    title="Pricing (Optional)"
                />
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="price"
                            label={<span style={{ fontWeight: '600', color: '#374151' }}>Price (USD)</span>}
                        >
                            <InputNumber
                                size="large"
                                style={{
                                    width: '100%',
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb'
                                }}
                                placeholder="0.00 (Optional)"
                                min={0}
                                precision={2}
                                formatter={(value) => value ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="priceUnit"
                            label={<span style={{ fontWeight: '600', color: '#374151' }}>Price Unit</span>}
                        >
                            <Select
                                size="large"
                                placeholder="Select pricing unit"
                                style={{ borderRadius: '12px' }}
                            >
                                <Select.Option value="day">📅 Per Day</Select.Option>
                                <Select.Option value="week">📆 Per Week</Select.Option>
                                <Select.Option value="month">🗓️ Per Month</Select.Option>
                                <Select.Option value="hour">⏰ Per Hour</Select.Option>
                                <Select.Option value="service">🔧 Per Service</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <div style={{
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    marginTop: '8px'
                }}>
                    <Text type="secondary" style={{ fontSize: '13px', display: 'block', color: '#6b7280' }}>
                        💡 Price is optional. Leave blank if you prefer to discuss pricing with clients directly.
                    </Text>
                </div>
            </div>

            {/* Description Section */}
            <div style={{ marginBottom: '40px' }}>
                <SectionHeader
                    icon={
                        <svg style={{ width: '22px', height: '22px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    title="Description"
                />
                <Form.Item
                    name="description"
                    label={<span style={{ fontWeight: '600', color: '#374151' }}>Service Description</span>}
                    rules={[{ required: true, message: 'Please enter description' }]}
                >
                    <TextArea
                        rows={6}
                        placeholder="Provide a detailed description of the service, including what's included and any special features..."
                        style={{
                            borderRadius: '12px',
                            border: '2px solid #e5e7eb',
                            fontSize: '15px'
                        }}
                    />
                </Form.Item>
            </div>

            {/* Images Section */}
            <div style={{ marginBottom: '32px' }}>
                <SectionHeader
                    icon={
                        <svg style={{ width: '22px', height: '22px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                    title="Service Images *"
                />
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    beforeUpload={beforeUpload}
                    customRequest={({ onSuccess }) => {
                        // Just mark as done - actual upload happens on form submit
                        setTimeout(() => {
                            onSuccess?.('ok');
                        }, 0);
                    }}
                    multiple
                    maxCount={10}
                    className="service-image-uploader"
                >
                    {fileList.length < 10 && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                margin: '0 auto 8px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <PlusOutlined style={{ fontSize: '24px', color: 'white' }} />
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Upload Images</div>
                        </div>
                    )}
                </Upload>
                <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb'
                }}>
                    <Text type="secondary" style={{ fontSize: '13px', display: 'block', color: '#6b7280' }}>
                        📸 Upload at least 1 image (up to 10) - Images will be uploaded to Digital Ocean
                    </Text>
                    <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginTop: '4px', color: '#9ca3af' }}>
                        • Max size: 10MB per image • Supported formats: JPG, PNG, WebP
                    </Text>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                gap: '12px',
                paddingTop: '24px',
                borderTop: '2px solid #f3f4f6',
                marginTop: '32px',
                flexDirection: 'row-reverse'
            }}>
                <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={loading}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        minWidth: '140px',
                        height: '48px',
                        fontSize: '15px',
                        fontWeight: '600',
                        boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(102, 126, 234, 0.4)';
                    }}
                >
                    {initialValues ? '✓ Update Service' : '+ Add Service'}
                </Button>
                <Button
                    size="large"
                    onClick={onCancel}
                    style={{
                        borderRadius: '12px',
                        minWidth: '100px',
                        height: '48px',
                        fontSize: '15px',
                        fontWeight: '600',
                        border: '2px solid #e5e7eb',
                        color: '#6b7280'
                    }}
                >
                    Cancel
                </Button>
            </div>
        </Form>
    );
}
