import React from 'react';
import { Typography, Card, Row, Col, Button } from 'antd';
import { ShopOutlined, TagOutlined, CustomerServiceOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const RetailBlog = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <Title level={1} className="text-blue-600">
          Retail Blog
        </Title>
        <Paragraph className="text-gray-700 text-lg">
          Discover the latest trends in retail, business growth strategies, and how to engage more customers effectively.
        </Paragraph>
      </div>

      {/* Features Section */}
      <Row gutter={[24, 24]} className="mb-16">
        {/* Feature 1: Increase Sales */}
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="rounded-lg shadow-lg p-6 bg-blue-50 transition-transform transform hover:scale-105"
            style={{ minHeight: '300px' }}
          >
            <div className="flex flex-col items-center justify-between h-full">
              <ShopOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={3} className="text-blue-700 text-center">
                Increase Sales
              </Title>
              <Paragraph className="text-gray-600 text-center">
                Learn strategies to boost sales and enhance customer engagement with personalized retail experiences.
              </Paragraph>
            </div>
          </Card>
        </Col>

        {/* Feature 2: Product Marketing */}
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="rounded-lg shadow-lg p-6 bg-blue-50 transition-transform transform hover:scale-105"
            style={{ minHeight: '300px' }}
          >
            <div className="flex flex-col items-center justify-between h-full">
              <TagOutlined className="text-4xl text-green-500 mb-4" />
              <Title level={3} className="text-blue-700 text-center">
                Product Marketing
              </Title>
              <Paragraph className="text-gray-600 text-center">
                Master the art of product marketing by understanding customer needs and reaching your target audience effectively.
              </Paragraph>
            </div>
          </Card>
        </Col>

        {/* Feature 3: Customer Service */}
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="rounded-lg shadow-lg p-6 bg-blue-50 transition-transform transform hover:scale-105"
            style={{ minHeight: '300px' }}
          >
            <div className="flex flex-col items-center justify-between h-full">
              <CustomerServiceOutlined className="text-4xl text-yellow-500 mb-4" />
              <Title level={3} className="text-blue-700 text-center">
                Customer Service
              </Title>
              <Paragraph className="text-gray-600 text-center">
                Enhance customer satisfaction by providing top-tier support and service that fosters long-term relationships.
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <Button type="primary" size="large" className="bg-blue-500 hover:bg-blue-700" onClick={() => window.history.back()}>
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default RetailBlog;
