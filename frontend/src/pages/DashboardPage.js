import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Form, Button, Radio, Checkbox, Input, notification, Spin, Modal, AutoComplete, List, Typography
} from 'antd';
import { UserAddOutlined, DesktopOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

// Custom CSS for specific styling needs
const customStyles = `
  .dark-card {
    background-color: #1f2937;
    color: white;
  }
  .dark-card .ant-card-head-title {
    color: white;
  }
  .dark-card .ant-form-item-label > label {
    color: #d1d5db;
  }
  .dark-card .ant-input, .dark-card .ant-input-number {
    background-color: #374151;
    border-color: #4b5563;
    color: white;
  }
  .dark-card .ant-input::placeholder {
    color: #9ca3af;
  }
  .game-checkbox-group .ant-checkbox-wrapper {
    background: #374151;
    border: 1px solid #4b5563;
    color: #d1d5db;
    padding: 4px 12px;
    border-radius: 16px;
    margin-right: 8px;
    margin-bottom: 8px;
  }
  .game-checkbox-group .ant-checkbox-wrapper-checked {
    background: #4f46e5;
    border-color: #4f46e5;
    color: white;
  }
  .game-checkbox-group .ant-checkbox-inner {
    display: none;
  }
  .submit-btn {
    background: linear-gradient(to right, #6366f1, #8b5cf6);
    border: none;
  }
`;

const DashboardPage = () => {
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [playerOptions, setPlayerOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workstationForm] = Form.useForm();
  const [createGameIdForm] = Form.useForm();
  const [searchType, setSearchType] = useState('user');

  // --- DATA FETCHING ---
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [gamesRes, playersRes] = await Promise.all([
        axios.get('http://localhost:5001/api/games'),
        axios.get('http://localhost:5001/api/users/players')
      ]);
      
      setGames(gamesRes.data);
      setPlayers(playersRes.data);
      
      const options = playersRes.data.map(p => ({
        value: p.username,
        label: `${p.name} (${p.username})`,
        key: p.user_id
      }));
      setPlayerOptions(options);

    } catch (error) {
      notification.error({ message: 'Failed to load initial data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- WORKSTATION LOGIC ---
  const handleWorkstationSearch = async (values) => {
    const searchTerm = values.search;
    if (!searchTerm) {
        notification.warning({ message: 'Please enter a search term.' });
        return;
    }
    setLoading(true);
    setSelectedUser(null);
    workstationForm.resetFields(['username', 'phone_number', 'amount']);
    try {
      const response = await axios.get(`http://localhost:5001/api/dashboard/search?username=${searchTerm}`);
      const userDetails = {
          ...players.find(p => p.username === searchTerm),
          ...response.data
      };
      setSelectedUser(userDetails);
      workstationForm.setFieldsValue({
          username: userDetails.name,
      });
      notification.success({ message: `Found user: ${userDetails.username}`});
    } catch (error) {
      notification.error({ message: 'Search Failed', description: 'User not found or an error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  // --- CREATE GAME ID LOGIC ---
  const handleCreateGameID = async (values) => {
    const searchUsername = workstationForm.getFieldValue('search');
    const targetUser = players.find(p => p.username === searchUsername);

    if (!targetUser) {
      notification.warning({ message: 'No User Selected', description: 'Please search for and select a valid user in the Workstation first.' });
      return;
    }

    const payload = {
      user_id: targetUser.user_id,
      game_ids: values.games,
      phone_number: values.phoneNumber,
      amount: values.amount
    };
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/dashboard/create-accounts', payload);
      
      Modal.success({
        title: 'Game Accounts Created!',
        content: (
          <div>
            <p>The following accounts were created for <strong>{targetUser.username}</strong>:</p>
            <ul>
              {response.data.accounts.map(acc => (
                <li key={acc.game_account_id}>{acc.game_name}: <strong>{acc.game_account_id}</strong></li>
              ))}
            </ul>
          </div>
        ),
      });

      createGameIdForm.resetFields();
      // No need to refresh workstation data as it's not directly displayed there
    } catch (error) {
      notification.error({ message: 'Creation Failed', description: 'Could not create game accounts.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <style>{customStyles}</style>
      <Row gutter={[24, 24]}>
        {/* Left Column: Workstation */}
        <Col xs={24} lg={14}>
          <Card title={<><DesktopOutlined /> Workstation</>}>
            <Form form={workstationForm} layout="vertical" onFinish={handleWorkstationSearch}>
              <Form.Item label="Search Type" name="searchType" initialValue="user">
                <Radio.Group onChange={(e) => setSearchType(e.target.value)} value={searchType}>
                  <Radio value="user">Search By System User ID</Radio>
                  <Radio value="kiosk">Check Kiosk Account</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Search" name="search" rules={[{ required: true, message: 'Please enter a username!' }]}>
                <Input.Search
                  placeholder="Enter username"
                  enterButton={<Button type="primary" icon={<SearchOutlined />} />}
                  onSearch={(value) => workstationForm.submit()}
                />
              </Form.Item>
              <Row gutter={16}>
                <Col span={24}>
                    <Form.Item label="User Account" name="username">
                        <Input placeholder="User's name will appear here" disabled />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item label="Phone Number" name="phone_number">
                        <Input placeholder="Enter phone number" />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item label="Amount" name="amount">
                        <Input placeholder="Enter amount" />
                    </Form.Item>
                </Col>
              </Row>
               <Form.Item>
                <Button type="primary" htmlType="submit" className="submit-btn">Submit</Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Column: Create Game ID */}
        <Col xs={24} lg={10}>
          <Card className="dark-card" title={<><UserAddOutlined /> Create Game ID</>}>
            <Form form={createGameIdForm} layout="vertical" onFinish={handleCreateGameID}>
              <Form.Item label="Games" name="games" rules={[{ required: true, message: 'Please select at least one game!' }]}>
                <Checkbox.Group className="game-checkbox-group">
                  <Row>
                    {games.map(game => (
                      <Col xs={12} sm={8} key={game.game_id}><Checkbox value={game.game_id}>{game.name}</Checkbox></Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
              <Form.Item label="Phone Number" name="phoneNumber">
                <Input placeholder="Enter phone number" />
              </Form.Item>
              <Form.Item label="Amount" name="amount">
                <Input type="number" placeholder="Enter amount" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="submit-btn" style={{ width: '100%' }}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default DashboardPage;
