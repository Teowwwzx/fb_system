import React, { useState, useEffect } from 'react';
import { Table, Input, Radio, Button, Tag, Tooltip, message, Spin, Card } from 'antd';
import { SearchOutlined, SyncOutlined, CopyOutlined } from '@ant-design/icons';
import QRCode from 'qrcode.react';

const GamesPage = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch games from the API
  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data/games');
      if (!response.ok) {
        throw new Error('Failed to fetch games data.');
      }
      const data = await response.json();
      setGames(data);
      setFilteredGames(data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  // Handle filtering
  useEffect(() => {
    let data = [...games];
    if (searchText) {
      data = data.filter(game =>
        (game.name || '').toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      data = data.filter(game => game.robot_status === statusFilter);
    }
    setFilteredGames(data);
  }, [searchText, statusFilter, games]);

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('URL copied to clipboard!');
  };

  const columns = [
    {
      title: '显示名称', // Display Name
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: '二维码 (Android)', // QR Code (Android)
      dataIndex: 'android_url',
      key: 'android_url',
      render: (url) => url ? <QRCode value={url} size={64} /> : '-',
    },
    {
      title: '二维码 (iOS)', // QR Code (iOS)
      dataIndex: 'ios_url',
      key: 'ios_url',
      render: (url) => url ? <QRCode value={url} size={64} /> : '-',
    },
    {
      title: '余额', // Balance
      dataIndex: 'balance',
      key: 'balance',
      sorter: (a, b) => a.balance - b.balance,
      render: (balance) => parseFloat(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
      title: '操作', // Action
      key: 'action',
      render: (text, record) => (
        <Button icon={<SyncOutlined />}>同步</Button> // Sync
      ),
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <div style={{ padding: '8px 24px' }}>
        <p>
          <strong>Android URL:</strong> {record.android_url || '-'}
          {record.android_url && (
            <Tooltip title="Copy URL">
              <Button type="text" icon={<CopyOutlined />} onClick={() => handleCopyToClipboard(record.android_url)} />
            </Tooltip>
          )}
        </p>
        <p>
          <strong>iOS URL:</strong> {record.ios_url || '-'}
           {record.ios_url && (
            <Tooltip title="Copy URL">
              <Button type="text" icon={<CopyOutlined />} onClick={() => handleCopyToClipboard(record.ios_url)} />
            </Tooltip>
          )}
        </p>
        <p>
          <strong>机器人状态:</strong> {/* Robot Status */}
          <Tag color={record.robot_status === 'active' ? 'green' : 'red'}>
            {record.robot_status === 'active' ? '启用' : '停用'}
          </Tag>
        </p>
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      <Card title="列表"> {/* List */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search game name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Radio.Group onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
            <span style={{ marginRight: 8 }}>机器人状态:</span> {/* Robot Status */}
            <Radio.Button value="all">全部</Radio.Button> {/* All */}
            <Radio.Button value="active">启用</Radio.Button> {/* Active */}
            <Radio.Button value="inactive">停用</Radio.Button> {/* Inactive */}
          </Radio.Group>
        </div>
        <Table
          columns={columns}
          dataSource={filteredGames}
          rowKey="game_id"
          expandable={{ expandedRowRender }}
        />
      </Card>
    </Spin>
  );
};

export default GamesPage;