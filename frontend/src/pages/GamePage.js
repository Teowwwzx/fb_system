import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Typography } from 'antd';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; // Import the new QR Code component

const { Paragraph } = Typography;

const GamePage = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get('http://localhost:5001/api/games')
            .then(response => {
                setGames(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching games:", error);
                setLoading(false);
            });
    }, []);

    // This function defines what to render in the expanded row
    const expandedRowRender = (record) => {
        return (
            <div style={{ padding: '8px 24px' }}>
                <p>
                    <strong>Android URL:</strong> <Paragraph copyable>{record.androidUrl}</Paragraph>
                </p>
                <p>
                    <strong>iOS URL:</strong> {record.iosUrl ? <Paragraph copyable>{record.iosUrl}</Paragraph> : '-'}
                </p>
                <p>
                    <strong>机器人状态 (Robot Status):</strong>{' '}
                    <Tag color={record.robotStatus === '启用' ? 'green' : 'red'}>
                        {record.robotStatus}
                    </Tag>
                </p>
            </div>
        );
    };

    const columns = [
        {
            title: '显示名称 (Display Name)',
            dataIndex: 'displayName',
            key: 'displayName',
        },
        {
            title: '二维码 (Android)',
            dataIndex: 'androidUrl',
            key: 'androidUrl',
            render: (url) => <QRCodeSVG value={url || 'N/A'} size={80} />,        },
        {
            title: '二维码 (iOS)',
            dataIndex: 'iosUrl',
            key: 'iosUrl',
            render: (url) => (url ? <QRCodeSVG value={url} size={80} /> : '-'),
        },
        {
            title: '余额 (Balance)',
            dataIndex: 'balance',
            key: 'balance',
            render: (balance) => balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        },
        {
            title: '操作 (Action)',
            key: 'action',
            render: () => <Button type="primary">同步</Button>,
        },
    ];

    return (
        <div>
            <Table
                columns={columns}
                dataSource={games}
                loading={loading}
                rowKey="id"
                expandable={{ expandedRowRender }} // This enables the expandable feature
            />
        </div>
    );
};

export default GamePage;