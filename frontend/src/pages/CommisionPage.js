import React, { useState } from 'react';
import { Form, DatePicker, Input, Button, Table, Card, Row, Col, Statistic, message } from 'antd';
import axios from 'axios';

const { RangePicker } = DatePicker;

const CommissionPage = () => {
    const [form] = Form.useForm();
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState({ totalTurnover: 0, totalCommission: 0 });
    const [loading, setLoading] = useState(false);

    // Function to handle the API call and calculate summary
    const handleSearch = (values) => {
        setLoading(true);
        
        const queryParams = {
            agentUsername: values.agentUsername,
            startDate: values.dateRange ? values.dateRange[0].format('YYYY-MM-DD') : undefined,
            endDate: values.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : undefined,
        };

        axios.get('http://localhost:5001/api/commissions', { params: queryParams })
            .then(response => {
                const data = response.data;
                setRecords(data);

                // Calculate summary totals
                if (data.length > 0) {
                    const totalTurnover = data.reduce((acc, item) => acc + item.turnover, 0);
                    const totalCommission = data.reduce((acc, item) => acc + item.commissionAmount, 0);
                    setSummary({ totalTurnover, totalCommission });
                } else {
                    setSummary({ totalTurnover: 0, totalCommission: 0 });
                }
            })
            .catch(error => {
                console.error("Error fetching commission data:", error);
                message.error("Failed to fetch commission data.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const columns = [
        { title: '代理 (Agent)', dataIndex: 'agentUsername', key: 'agentUsername' },
        { title: '游戏 (Game)', dataIndex: 'game', key: 'game' },
        { 
            title: '总流水 (Turnover)', 
            dataIndex: 'turnover', 
            key: 'turnover',
            render: (val) => `RM ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        },
        { 
            title: '佣金率 (Rate)', 
            dataIndex: 'commissionRate', 
            key: 'commissionRate',
            render: (val) => `${(val * 100).toFixed(2)}%`
        },
        { 
            title: '佣金 (Commission)', 
            dataIndex: 'commissionAmount', 
            key: 'commissionAmount',
            render: (val) => `RM ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        },
        { title: '日期 (Date)', dataIndex: 'date', key: 'date' },
    ];

    return (
        <div>
            <Card style={{ marginBottom: 24 }}>
                <Form form={form} onFinish={handleSearch}>
                    <Row gutter={24}>
                        <Col>
                            <Form.Item name="dateRange" label="日期范围 (Date Range)">
                                <RangePicker />
                            </Form.Item>
                        </Col>
                        <Col>
                            <Form.Item name="agentUsername" label="代理用户名 (Agent Username)">
                                <Input placeholder="Search by agent" />
                            </Form.Item>
                        </Col>
                        <Col>
                            <Form.Item label=" ">
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    搜索 (Search)
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <Card>
                        <Statistic title="总流水 (Total Turnover)" value={summary.totalTurnover} precision={2} prefix="RM" />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card>
                        <Statistic title="总佣金 (Total Commission)" value={summary.totalCommission} precision={2} prefix="RM" />
                    </Card>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={records}
                loading={loading}
                rowKey="id"
                bordered
            />
        </div>
    );
};

export default CommissionPage;