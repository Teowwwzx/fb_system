import React from 'react';
import { Button, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
        <Title level={2}>Welcome to the FB System</Title>
        <Paragraph>Your comprehensive management dashboard.</Paragraph>
        <Space>
          <Button type="primary" size="large" onClick={() => navigate('/login')}>
            Login
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default LandingPage;
