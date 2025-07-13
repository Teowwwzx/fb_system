import React, { useState } from 'react';
import { Form, DatePicker, Input, Select, Button, Space, Table, message } from 'antd';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Import the Excel library
import dayjs from 'dayjs'; // Ant Design uses dayjs for dates

const { RangePicker } = DatePicker;

const ActivityLogPage = () => {
    const [form] = Form.useForm();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    // Function to handle the API call based on filters
    const handleGenerate = (values) => {
        setLoading(true);
        
        // Format dates correctly for the API query
        const queryParams = {
            username: values.username,
            ip: values.ip,
            operation: values.operation,
            device: values.device,
            startDate: values.dateRange ? values.dateRange[0].startOf('day').toISOString() : undefined,
            endDate: values.dateRange ? values.dateRange[1].endOf('day').toISOString() : undefined,
        };

        axios.get('http://localhost:5001/api/activity-log', { params: queryParams })
            .then(response => {
                setLogs(response.data);
            })
            .catch(error => {
                console.error("Error fetching activity logs:", error);
                message.error("Failed to fetch logs.");
            })
            .finally(() => {
                setLoading(false);
            });
    };
    
    // Function to handle quick date selection
    const setDateRange = (range) => {
        let startDate, endDate = dayjs();
        if (range === 'today') {
            startDate = dayjs().startOf('day');
        } else if (range === 'yesterday') {
            startDate = dayjs().subtract(1, 'day').startOf('day');
            endDate = dayjs().subtract(1, 'day').endOf('day');
        }
        form.setFieldsValue({ dateRange: [startDate, endDate] });
    };

    // Function to export current table data to Excel
    const handleExport = () => {
        if (logs.length === 0) {
            message.warning("There is no data to export.");
            return;
        }
        const worksheet = XLSX.utils.json_to_sheet(logs);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ActivityLogs");
        XLSX.writeFile(workbook, "ActivityLog.xlsx");
    };
    
    const columns = [
        { title: '代理 (Agent)', dataIndex: 'agent', key: 'agent' },
        { title: 'IP地址 (IP Address)', dataIndex: 'ip', key: 'ip' },
        { title: '浏览器 (Browser)', dataIndex: 'browser', key: 'browser' },
        { title: '设备 (Device)', dataIndex: 'device', key: 'device' },
        { title: '操作 (Operation)', dataIndex: 'operation', key: 'operation' },
        { title: '详情 (Details)', dataIndex: 'details', key: 'details' },
        { title: '日期 (Date)', dataIndex: 'timestamp', key: 'timestamp' },
    ];

    return (
        <div>
            <Form form={form} onFinish={handleGenerate} layout="vertical">
                <Space wrap align="end" style={{ marginBottom: 24 }}>
                    <Form.Item name="dateRange" label="从日期 到 日期 (Date Range)">
                        <RangePicker />
                    </Form.Item>
                    <Form.Item name="username" label="用户名 (Username)">
                        <Input placeholder="输入用户名" />
                    </Form.Item>
                    <Form.Item name="ip" label="IP地址 (IP Address)">
                        <Input placeholder="输入IP地址" />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button onClick={() => setDateRange('today')}>今日</Button>
                            <Button onClick={() => setDateRange('yesterday')}>昨日</Button>
                        </Space>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button onClick={() => form.resetFields()}>重置 (Reset)</Button>
                            <Button type="primary" htmlType="submit">生成 (Generate)</Button>
                            <Button type="primary" style={{ background: '#107c41' }} onClick={handleExport}>转存Excel (Export)</Button>
                        </Space>
                    </Form.Item>
                </Space>
            </Form>
            
            <Table
                columns={columns}
                dataSource={logs}
                loading={loading}
                rowKey="id"
            />
        </div>
    );
};

export default ActivityLogPage;