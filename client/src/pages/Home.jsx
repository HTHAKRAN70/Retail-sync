import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Row, Col } from 'antd';
import { ArrowRightOutlined, ShopOutlined, AppstoreOutlined, CarOutlined } from '@ant-design/icons';
import inventory from '../assets/inventory.png';
import order from '../assets/order.png';
import delivery from '../assets/delivery.png';

const { Title, Paragraph } = Typography;

const roles = [
  {
    icon: <ShopOutlined className="text-blue-500 text-4xl" />,
    title: 'Retailers',
    description: 'Manage your shop inventory, track orders, and stay updated with supplier offers.',
    path: '/Retaile-blog',
  },
  {
    icon: <AppstoreOutlined className="text-green-500 text-4xl" />,
    title: 'Wholesalers',
    description: 'Control your stock, accept orders, and connect with delivery partners efficiently.',
    path: '/Wholesaler-blog',
  },
  {
    icon: <CarOutlined className="text-yellow-500 text-4xl" />,
    title: 'Delivery Partners',
    description: 'Find delivery jobs, get the order, track orders, and earn more with our partner programs.',
    path: '/Delivery-blog',
  },
];

const services = [
  {
    imgSrc: inventory,
    title: 'Inventory Management',
    description: 'Track, manage, and update your inventory with real-time data and reports.',
  },
  {
    imgSrc: order,
    title: 'Order Tracking',
    description: 'Stay informed with real-time order tracking, from approval to delivery.',
  },
  {
    imgSrc: delivery,
    title: 'Delivery Management',
    description: 'Partner with trusted delivery services and ensure timely order fulfillment.',
  },
];

const Home = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* Welcome Section */}
      <div className="text-center mb-12">
        <Card
          className="relative rounded-xl shadow-lg overflow-hidden text-white p-10 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"
          style={{ backgroundSize: 'cover' }}
        >
          <div className="relative z-10">
            <Title level={1} className="text-white">
              Welcome to Our Platform
            </Title>
            <Paragraph className="text-white text-lg">
              Are you a Retailer, Wholesaler, or Delivery Partner? Join us to manage your business effortlessly.
            </Paragraph>
            <Button
              type="primary"
              shape="round"
              icon={<ArrowRightOutlined />}
              size="large"
              className="mt-4 bg-white text-black hover:cursor-pointer hover:bg-blue-100"
              onClick={() => handleNavigation('/signup')}
            >
              Get Started
            </Button>
          </div>
        </Card>
      </div>

      {/* Role Section */}
      <Row gutter={[24, 24]} className="mb-12">
        {roles.map((role, index) => (
          <Col key={index} xs={24} sm={12} md={8}>
            <Card
              hoverable
              className="rounded-lg h-[300px] shadow-md p-6 transition-transform transform hover:scale-105 bg-white"
              onClick={() => handleNavigation(role.path)}
            >
              <div className="flex flex-col items-center">
                {role.icon}
                <Title level={3} className="mt-4">
                  {role.title}
                </Title>
                <Paragraph className="text-gray-600 text-center">{role.description}</Paragraph>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Services Section */}
      <div className="text-center mb-12">
  <Title level={2} className="text-gray-800">
    Our Services
  </Title>
  <Paragraph className="text-gray-600 mb-8">
    We provide a range of solutions to streamline your business:
  </Paragraph>
  <Row gutter={[24, 24]} justify="center" align="middle" className="flex">
  {services.map((service, index) => (
    <Col key={index} xs={24} sm={12} md={8} lg={6}>
      <Card
        hoverable
        className="rounded-lg shadow-md bg-white transition-transform transform hover:scale-105"
        style={{
          height: '100%',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '380px', // Minimum height to ensure consistency
        }}
      >
        <div className="flex flex-col items-center justify-between flex-grow">
          <img
            src={service.imgSrc}
            alt={service.title}
            className="w-20 h-20 mb-4 object-contain"
            style={{ maxWidth: '80%', maxHeight: '80px' }} // Ensure the image stays within the card
          />
          <Title level={4} className="text-gray-800 text-center mb-2">
            {service.title}
          </Title>
          <Paragraph className="text-gray-600 text-center flex-grow">{service.description}</Paragraph>
        </div>
      </Card>
    </Col>
  ))}
</Row>

</div>


      {/* About Us Section */}
      <div className="p-8 bg-white rounded-lg shadow-md text-center mb-12">
        <Title level={2} className="text-gray-800">
          About Us
        </Title>
        <Paragraph className="text-gray-600 text-base leading-relaxed">
          We empower businesses—whether you're a retailer, wholesaler, or delivery partner. Our mission is to simplify
          operations, giving you the tools to manage inventory, track sales, and handle deliveries efficiently.
        </Paragraph>
        <Paragraph className="text-gray-600 text-base leading-relaxed">
          Focus on delivering quality products to your customers while we handle the logistics. Our platform ensures
          your business stays competitive and efficient.
        </Paragraph>
        <Button type="primary" shape="round" icon={<ArrowRightOutlined />} size="large" className="mt-4">
          Learn More About Us
        </Button>
      </div>

      {/* Footer */}
      <footer className="p-10 bg-gray-800 text-white">
        <div className="container mx-auto">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-xl font-semibold mb-4">About Us</h3>
              <p className="text-gray-400 leading-relaxed">
                We are dedicated to empowering businesses with tools to streamline operations, manage inventory, and
                improve delivery processes. Join us to revolutionize your business!
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-gray-400 hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/services" className="text-gray-400 hover:text-white">
                    Our Services
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-400 hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-gray-400 hover:text-white">
                    FAQs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-400">
                <strong>Email:</strong> support@yourcompany.com
              </p>
              <p className="text-gray-400">
                <strong>Phone:</strong> +1 (123) 456-7890
              </p>
              <p className="text-gray-400">
                <strong>Address:</strong> 123 Business St, City, Country
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 my-8"></div>
          <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
            <p className="text-gray-400">© 2024 Your Company | All Rights Reserved</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-400 hover:text-white">
                Facebook
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white">
                Twitter
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-white">
                Instagram
              </a>

        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white"
        >
          <i className="fab fa-linkedin-in"></i> LinkedIn
        </a>
      </div>
    </div>
  </div>
</footer>

    </div>
  );
};

export default Home;

