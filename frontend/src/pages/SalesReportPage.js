import React, { useState } from 'react';
import { Form, DatePicker, Select, Radio, Checkbox, Button, Space, Table, Card, Row, Col, message } from 'antd';
import axios from 'axios';

const { RangePicker } = DatePicker;
const gameOptions = [
    'XE88', 'PUSSY', 'ROLLEX', 'KISS2', 'GW', 'ace333', 'Live22', 'Vpower', '918kaya',
    'Joker', 'EVO88', 'NTC', 'MEGA88', '3win8', 'SKY777', 'LionKing', 'MKING', 'Pcilve',
    '918KISS', 'MEGA1', 'PLAYBOY', 'SUNCITY', 'LPF88', 'KING855', 'UUSLOT', 'PP', 'LUCKY365',
    'WF', 'KISS918', 'TTGOALS'
];

const SalesReportPage = () => {
    const [form] = Form.useForm();
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    const onFinish = (values) => {
        setLoading(true);
        axios.post('http://localhost:5001/api/reports/sales', values)
            .then(response => {
                setReportData(response.data);
                message.success('Report generated successfully.');
            })
            .catch(error => message.error('Failed to generate report.'))
            .finally(() => setLoading(false));
    };

    const reportColumns = [
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Agent', dataIndex: 'agent', key: 'agent' },
        { title: 'Game', dataIndex: 'game', key: 'game' },
        { title: 'Turnover', dataIndex: 'turnover', key: 'turnover', render: val => val.toFixed(2) },
        { title: 'Win/Loss', dataIndex: 'winLoss', key: 'winLoss', render: val => val.toFixed(2) },
    ];

    return (
        <Card title="销售报告 (Sales Report)">
            <Form form={form} onFinish={onFinish} layout="vertical">
                {/* Row 1: Date and Agent */}
                <Row gutter={24}>
                    <Col><Form.Item name="dateRange" label="从日期 到 日期"><RangePicker /></Form.Item></Col>
                    <Col><Form.Item name="agent" label="代理"><Select defaultValue="all"><Select.Option value="all">全部</Select.Option></Select></Form.Item></Col>
                    <Col><Form.Item name="classification" label="分类子"><Radio.Group><Radio value="agent">代理</Radio><Radio value="game">游戏</Radio></Radio.Group></Form.Item></Col>
                    <Col><Form.Item name="includeInactive" valuePropName="checked"><Checkbox>包括不活跃代理</Checkbox></Form.Item></Col>
                </Row>
                {/* Row 2: Quick Dates */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col><Button>今日</Button></Col>
                    <Col><Button>最近24小時</Button></Col>
                    <Col><Button>昨日</Button></Col>
                    <Col><Button>本星期</Button></Col>
                    <Col><Button>上星期</Button></Col>
                    <Col><Button>本月</Button></Col>
                    <Col><Button>上个月</Button></Col>
                </Row>
                {/* Row 3: Games */}
                <Form.Item name="games" label="游戏">
                    <Checkbox.Group options={gameOptions} />
                </Form.Item>
                {/* Row 4: Actions */}
                <Form.Item>
                    <Space>
                        <Button onClick={() => form.resetFields()}>重置 (Reset)</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>生成 (Generate)</Button>
                    </Space>
                </Form.Item>
            </Form>
            
            <Table
                style={{ marginTop: 24 }}
                columns={reportColumns}
                dataSource={reportData}
                loading={loading}
                rowKey="id"
                bordered
            />
        </Card>
    );
};

export default SalesReportPage;