import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Tag, Space, Input, Radio, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons'; // Import icon
import axios from 'axios';


const AgentListPage = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);

    // This function runs when the component loads
    useEffect(() => {
        // Fetch data from our backend API
        axios.get('http://localhost:5001/api/agents')
            .then(response => {
                setAgents(response.data); // Store the data in state
                setLoading(false); // Stop the loading indicator
            })
            .catch(error => {
                console.error("There was an error fetching the agents!", error);
                setLoading(false); // Also stop loading on error
            });
    }, []);

    // Define the columns for the table
    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '名字',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '状态',
            key: 'status',
            dataIndex: 'status',
            render: status => (
                <Tag color={status === 'Active' ? 'green' : 'volcano'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: '种类',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: '最后登录',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
        },
        {
            title: '操作',
            key: 'action',
            render: () => (
                <Space size="middle">
                    <Button type="primary" size="small">编辑</Button>
                    <Button size="small">设置额度</Button>
                    <Button type="link" size="small">报告</Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                    <Input.Search placeholder="搜索" style={{ width: 200 }} />
                    <Radio.Group defaultValue="all">
                        <Radio.Button value="all">全部</Radio.Button>
                        <Radio.Button value="active">活泼</Radio.Button>
                        <Radio.Button value="paused">暂停</Radio.Button>
                    </Radio.Group>
                </Space>
                {/* NEW: Add Create button */}
                <Link to="/agents/create">
                    <Button type="primary" icon={<PlusOutlined />}>
                        创建总代理
                    </Button>
                </Link>
            </Space>
            <Table 
                columns={columns}
                dataSource={agents}
                loading={loading}
                rowKey="id"
            />
        </div>
    );
};

export default AgentListPage;