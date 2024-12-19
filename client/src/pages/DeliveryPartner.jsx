import React from 'react';
import { Typography, Card, Row, Col, Button } from 'antd';
import { CarOutlined, ClockCircleOutlined, TrophyOutlined, UserSwitchOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const DeliveryPartner = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <Title level={1} className="text-blue-600">
          <CarOutlined className="mr-2 text-blue-500" />
          Delivery Partner Hub
        </Title>
        <Paragraph className="text-gray-700 text-lg">
          Join our network of delivery partners and enjoy the freedom to work on your schedule, earn rewards, and provide top-notch service to customers.
        </Paragraph>
      </div>

      {/* Features Section */}
      <Row gutter={[24, 24]} className="mb-16">
        {/* Feature 1: Real-Time Tracking */}
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="rounded-lg shadow-lg p-6 bg-blue-50 transition-transform transform hover:scale-105"
            style={{ minHeight: '320px' }} // Ensuring same height for each card
          >
            <div className="flex flex-col items-center justify-between h-full">
              <ClockCircleOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={3} className="text-blue-700 text-center">
                Real-Time Tracking
              </Title>
              <Paragraph className="text-gray-600 text-center">
                Stay informed with real-time updates on your assigned orders, ensuring timely deliveries and better customer satisfaction.
              </Paragraph>
            </div>
          </Card>
        </Col>

        {/* Feature 2: Reward Programs */}
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="rounded-lg shadow-lg p-6 bg-blue-50 transition-transform transform hover:scale-105"
            style={{ minHeight: '320px' }} // Ensuring same height for each card
          >
            <div className="flex flex-col items-center justify-between h-full">
              <TrophyOutlined className="text-4xl text-green-500 mb-4" />
              <Title level={3} className="text-blue-700 text-center">
                Reward Programs
              </Title>
              <Paragraph className="text-gray-600 text-center">
                Earn valuable rewards, bonuses, and incentives based on your delivery performance, customer ratings, and loyalty.
              </Paragraph>
            </div>
          </Card>
        </Col>

        {/* Feature 3: Flexible Schedule */}
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="rounded-lg shadow-lg p-6 bg-blue-50 transition-transform transform hover:scale-105"
            style={{ minHeight: '320px' }} // Ensuring same height for each card
          >
            <div className="flex flex-col items-center justify-between h-full">
              <CarOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={3} className="text-blue-700 text-center">
                Flexible Schedule
              </Title>
              <Paragraph className="text-gray-600 text-center">
                Enjoy the flexibility to choose your own working hours. Pick up deliveries when it’s most convenient for you.
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Additional Features */}
      <Row gutter={[24, 24]} className="mb-16">
        {/* Feature 4: Community Support */}
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="rounded-lg shadow-lg p-6 bg-blue-50 transition-transform transform hover:scale-105"
            style={{ minHeight: '320px' }} // Ensuring same height for each card
          >
            <div className="flex flex-col items-center justify-between h-full">
              <UserSwitchOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={3} className="text-blue-700 text-center">
                Community Support
              </Title>
              <Paragraph className="text-gray-600 text-center">
                Be a part of a community that helps each other. Get access to helpful resources, tips, and peer support.
              </Paragraph>
            </div>
          </Card>
        </Col>

        {/* Feature 5: Safety and Security */}
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="rounded-lg shadow-lg p-6 bg-blue-50 transition-transform transform hover:scale-105"
            style={{ minHeight: '320px' }} // Ensuring same height for each card
          >
            <div className="flex flex-col items-center justify-between h-full">
              <ClockCircleOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={3} className="text-blue-700 text-center">
                Safety & Security
              </Title>
              <Paragraph className="text-gray-600 text-center">
                We ensure your safety with our comprehensive training and the latest safety protocols to keep you protected on every delivery.
              </Paragraph>
            </div>
          </Card>
        </Col>

        {/* Feature 6: Earnings Transparency */}
        <Col xs={24} sm={12} md={8}>
          <Card
            hoverable
            className="rounded-lg shadow-lg p-6 bg-blue-50 transition-transform transform hover:scale-105"
            style={{ minHeight: '320px' }} // Ensuring same height for each card
          >
            <div className="flex flex-col items-center justify-between h-full">
              <TrophyOutlined className="text-4xl text-green-500 mb-4" />
              <Title level={3} className="text-blue-700 text-center">
                Earnings Transparency
              </Title>
              <Paragraph className="text-gray-600 text-center">
                Track your earnings transparently. Our platform allows you to view and monitor your income in real-time.
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

export default DeliveryPartner;
