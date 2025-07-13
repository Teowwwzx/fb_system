import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Form, Input, Button, Radio, Checkbox, Select, notification, Spin,
} from 'antd';
import { SearchOutlined, UserAddOutlined, DesktopOutlined } from '@ant-design/icons';

const { Option } = Select;

const DashboardPage = () => {
  const [games, setGames] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Fetch games list on component mount
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/data/games');
        if (response.ok) {
          const gamesData = await response.json();
          setGames(gamesData);
        } else {
          // Fallback to mock data if API fails
          const mockGames = [
            { game_id: 1, name: '918KISS' }, { game_id: 2, name: 'MEGA88' }, { game_id: 3, name: 'PUSSY888' },
            { game_id: 4, name: 'JOKER' }, { game_id: 5, name: 'ROLLEX' }, { game_id: 6, name: 'Live22' },
          ];
          setGames(mockGames);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
        // Fallback to mock data
        const mockGames = [
          { game_id: 1, name: '918KISS' }, { game_id: 2, name: 'MEGA88' }, { game_id: 3, name: 'PUSSY888' },
          { game_id: 4, name: 'JOKER' }, { game_id: 5, name: 'ROLLEX' }, { game_id: 6, name: 'Live22' },
        ];
        setGames(mockGames);
      }
    };
    
    fetchGames();
  }, []);

  const onSearch = async (values) => {
    setLoading(true);
    setSearchResult(null);
    try {
      const response = await fetch(`/api/dashboard/search?username=${values.username}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'User not found');
      }
      const data = await response.json();
      setSearchResult(data);
    } catch (error) {
      notification.error({ message: 'Search Failed', description: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const onCreateGameID = async (values) => {
    // This function would be more complex, needing a selected user from the search result first.
    // For now, let's assume we are creating an account for the searched user.
    if (!searchResult) {
        notification.warning({ message: 'No User Selected', description: 'Please search for a user first.' });
        return;
    }
    
    // Example: Create an account for the first game selected
    const gameToCreate = {
        username: searchResult.username,
        game_id: values.games[0], // simplified
        phone_number: values.phoneNumber,
        amount: values.amount
    };

    try {
      const response = await fetch('/api/dashboard/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameToCreate),
      });
       if (!response.ok) throw new Error('Failed to create game ID.');
       
       notification.success({ message: 'Success', description: `Game ID created for ${gameToCreate.username}!` });
       form.resetFields(['games', 'phoneNumber', 'amount']);
       onSearch({ username: searchResult.username }); // Refresh search results
    } catch (error) {
       notification.error({ message: 'Creation Failed', description: error.message });
    }
  };

  return (
    <Spin spinning={loading}>
      <Row gutter={[24, 24]}>
        {/* Left Column: Workstation */}
        <Col xs={24} lg={14}>
          <Card title={<><DesktopOutlined /> Workstation</>}>
            <Form onFinish={onSearch}>
              <Form.Item label="Search Type" name="searchType" initialValue="user">
                <Radio.Group>
                  <Radio value="user">Search By System User ID</Radio>
                  <Radio value="kiosk">Check Kiosk Account</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Search" name="username" rules={[{ required: true, message: 'Please enter a username!' }]}>
                <Input prefix={<SearchOutlined />} placeholder="Enter username" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">Search</Button>
              </Form.Item>
            </Form>

            {searchResult && (
              <div style={{ marginTop: 24, borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
                <Row gutter={16}>
                  <Col span={12}><p><strong>Username:</strong> {searchResult.username}</p></Col>
                  <Col span={12}><p><strong>Name:</strong> {searchResult.name}</p></Col>
                </Row>
                <h3 style={{marginTop: 16}}>Game Accounts:</h3>
                {searchResult.accounts.length > 0 ? (
                    searchResult.accounts.map(acc => (
                        <p key={acc.game_account_id}><strong>{acc.game_name}:</strong> {acc.game_account_id} (Balance: {acc.balance})</p>
                    ))
                ) : <p>No game accounts found for this user.</p>}
              </div>
            )}
          </Card>
        </Col>

        {/* Right Column: Create Game ID */}
        <Col xs={24} lg={10}>
          <Card title={<><UserAddOutlined /> Create Game ID</>}>
            <Form form={form} layout="vertical" onFinish={onCreateGameID}>
              <Form.Item label="Games" name="games" rules={[{ required: true, message: 'Please select at least one game!' }]}>
                <Checkbox.Group style={{ width: '100%' }}>
                  <Row>
                    {games.map(game => (
                      <Col span={8} key={game.game_id}><Checkbox value={game.game_id}>{game.name}</Checkbox></Col>
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
                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Submit</Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default DashboardPage;