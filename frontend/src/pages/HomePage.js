// frontend/src/pages/HomePage.js

import React from 'react';
import { Row, Col, Card, Form, Radio, Input, InputNumber, Button, Typography, Space } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const gameOptions = ['918KISS', 'KISS918', 'PUSSY', 'MEGA1', 'MEGA88'];

const HomePage = () => {

  const onCreateGameId = (values) => {
    console.log('Create Game ID form submitted:', values);
    // We would connect this to an API endpoint later
  };

  return (
    <Row gutter={24}>
      {/* --- Left Column: Workbench --- */}
      <Col span={14}>
        <Card>
          <Title level={4}>工作台 (Workbench)</Title>
          <Form layout="vertical">
            <Form.Item label="Search Type:">
              <Radio.Group>
                <Radio value="systemUser">Search By System User ID</Radio>
                <Radio value="kioskAccount">Check Kiosk Account</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="游戏 (Game):">
              <Radio.Group>
                {gameOptions.map(game => <Radio key={game} value={game}>{game}</Radio>)}
              </Radio.Group>
            </Form.Item>
            <Form.Item label="搜索 (Search):">
              <Input placeholder="输入用户名" />
            </Form.Item>
            <Form.Item label="User Account:">
              <Input placeholder="Enter User Name" />
            </Form.Item>
            <Form.Item label="电话号码 (Phone Number):">
              <Input placeholder="输入电话号码" />
            </Form.Item>
            <Form.Item label="金额 (Amount):">
              <Input placeholder="输入金额" />
            </Form.Item>
          </Form>
        </Card>
      </Col>

      {/* --- Right Column: Create Game ID --- */}
      <Col span={10}>
        <Card style={{ backgroundColor: '#1f2937', color: 'white' }}>
          <Title level={4} style={{ color: 'white' }}>
            <Space><UserAddOutlined />创建游戏ID (Create Game ID)</Space>
          </Title>
          <Form layout="vertical" onFinish={onCreateGameId} initialValues={{ game: '918KISS' }}>
            <Form.Item label={<Text style={{ color: 'white' }}>游戏 (Game):</Text>} name="game">
              <Radio.Group>
                {gameOptions.map(game => <Radio key={game} value={game} style={{ color: 'white' }}>{game}</Radio>)}
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label={<Text style={{ color: 'white' }}>电话号码 (Phone Number):</Text>}
              name="phoneNumber"
              rules={[{ required: true, min: 10, message: 'Please enter at least 10 characters.' }]}
            >
              <Input placeholder="123132132" />
            </Form.Item>
            <Form.Item
              label={<Text style={{ color: 'white' }}>金额 (Amount):</Text>}
              name="amount"
              rules={[
                { required: true, message: 'Please enter an amount.' },
                { type: 'number', max: 0, message: 'Please enter a value less than or equal to 0.' }
              ]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="100" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                提交 (Submit)
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default HomePage;