import React from 'react';
import { Typography, Card, Row, Col, Button } from 'antd';
import { TruckOutlined, DollarOutlined, BuildOutlined, BarChartOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const WholesalerBlog = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <Title level={1} className="text-blue-600">
          Wholesaler Blog
        </Title>
        <Paragraph className="text-gray-700 text-lg">
          Learn how to streamline your wholesale operations, maximize profits, and build better relationships with retailers.
        </Paragraph>
      </div>

      {/* Features Section */}
      <Row gutter={[24, 24]} className="mb-16">
        {/* Feature 1: Supply Chain Management */}
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="rounded-lg shadow-lg p-6 bg-blue-50 transition-transform transform hover:scale-105"
            style={{ minHeight: '300px' }}
          >
            <div className="flex flex-col items-center justify-between h-full">
              <TruckOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={3} className="text-blue-700 text-center">
                Supply Chain Management
              </Title>
              <Paragraph className="text-gray-600 text-center">
                Optimize your supply chain with smarter logistics, reducing costs and improving efficiency in your operations.
              </Paragraph>
            </div>
          </Card>
        </Col>

        {/* Feature 2: Profit Optimization */}
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="rounded-lg shadow-lg p-6 bg-blue-50 transition-transform transform hover:scale-105"
            style={{ minHeight: '300px' }}
          >
            <div className="flex flex-col items-center justify-between h-full">
              <DollarOutlined className="text-4xl text-green-500 mb-4" />
              <Title level={3} className="text-blue-700 text-center">
                Profit Optimization
              </Title>
              <Paragraph className="text-gray-600 text-center">
                Learn effective techniques to boost your profit margins while maintaining competitive pricing.
              </Paragraph>
            </div>
          </Card>
        </Col>

        {/* Feature 3: Wholesale Partnerships */}
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="rounded-lg shadow-lg p-6 bg-blue-50 transition-transform transform hover:scale-105"
            style={{ minHeight: '300px' }}
          >
            <div className="flex flex-col items-center justify-between h-full">
              <BuildOutlined className="text-4xl text-yellow-500 mb-4" />
              <Title level={3} className="text-blue-700 text-center">
                Wholesale Partnerships
              </Title>
              <Paragraph className="text-gray-600 text-center">
                Build strategic partnerships with retailers to ensure mutual growth and a stable customer base.
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

export default WholesalerBlog;
