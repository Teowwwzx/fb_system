import React, { useState, useEffect } from 'react';
import { Table, Tag, message, Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SubAccountPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5001/api/sub-accounts')
            .then(response => {
                setAccounts(response.data);
                setLoading(false);
            })
            .catch(error => {
                message.error("Failed to fetch sub accounts.");
                setLoading(false);
            });
    }, []);

    const columns = [
        { title: '用户名 (Username)', dataIndex: 'username', key: 'username' },
        { title: '最后登录 (Last Login)', dataIndex: 'lastLogin', key: 'lastLogin' },
        { title: '备注 (Remarks)', dataIndex: 'remarks', key: 'remarks' },
        {
            title: '状态 (Status)',
            dataIndex: 'status',
            key: 'status',
            render: status => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
            ),
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Link to="/sub-accounts/create">
                    <Button type="primary" icon={<PlusOutlined />}>创建 (Create)</Button>
                </Link>
            </Space>
            <Table
                columns={columns}
                dataSource={accounts}
                loading={loading}
                rowKey="id"
                bordered
            />
        </div>
    );
};

export default SubAccountPage;