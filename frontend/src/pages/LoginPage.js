import React from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

// Use the Render backend URL
const API_URL = 'https://fb-system.onrender.com/api';

const LoginPage = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username: values.username,
        password: values.password,
      });

      if (response.status === 200) {
        message.success('Login successful!');
        // Here you would typically save the token, e.g., in localStorage
        // localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/dashboard'); // Redirect to the dashboard
      } 
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (error.response && error.response.status === 401) {
        errorMessage = 'Invalid username or password.';
      }
      message.error(errorMessage);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <div style={{ width: 350, padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>Login</Title>
        <Form
          name="normal_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
