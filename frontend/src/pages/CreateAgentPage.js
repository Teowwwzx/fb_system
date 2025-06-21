import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Radio, InputNumber, message, Spin } from 'antd';
import axios from 'axios';

const CreateAgentPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    console.log('Form values:', values);
    setLoading(true);
    
    try {
      const response = await axios.post('https://fb-system.onrender.com/api/agents', values);
      
      if (response.status === 201) {
        message.success('Agent created successfully!');
        navigate('/agents/list'); // Redirect to the agent list page after creation
      } else {
        message.error(response.data.message || 'Failed to create agent.');
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
      message.error(error.response?.data?.message || 'Failed to create agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <h2>创建总代理 (Create General Agent)</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ status: 'active', type: 'daily', dailyLimit: 100, onetimeLimit: 100 }}
      >
        <Form.Item
          name="username"
          label="用户名 (Username)"
          rules={[{ required: true, message: 'Please input the username!' }]}
        >
          <Input placeholder="输入用户名" />
        </Form.Item>

        <Form.Item
          name="name"
          label="名字 (Name)"
          rules={[{ required: true, message: 'Please input the name!' }]}
        >
          <Input placeholder="输入名字" />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码 (Password)"
          rules={[{ required: true, message: 'Please input the password!' }]}
        >
          <Input.Password placeholder="输入密码" />
        </Form.Item>

        <Form.Item name="dailyLimit" label="每日限额 (Daily Limit)">
            <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item name="onetimeLimit" label="一次性限额 (One-time Limit)">
            <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="status" label="状态 (Status)">
          <Radio.Group>
            <Radio.Button value="active">活泼</Radio.Button>
            <Radio.Button value="inactive">暂停</Radio.Button>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item name="type" label="种类 (Type)">
          <Radio.Group>
            <Radio.Button value="daily">每日</Radio.Button>
            <Radio.Button value="onetime">一次</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            提交 (Submit)
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default CreateAgentPage;