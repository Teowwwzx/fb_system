import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import axios from 'axios';

const CreateSubAccountPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = (values) => {
        axios.post('http://localhost:5001/api/sub-accounts', values)
            .then(response => {
                message.success('Sub Account created successfully!');
                navigate('/sub-accounts');
            })
            .catch(error => {
                message.error('Failed to create sub account.');
            });
    };

    return (
        <Card title="创建子账户 (Create Sub Account)">
            <Form form={form} onFinish={onFinish} layout="vertical" style={{ maxWidth: 400 }}>
                <Form.Item name="username" label="用户名 (Username)" rules={[{ required: true }]}>
                    <Input placeholder="Enter username" />
                </Form.Item>
                <Form.Item name="password" label="密码 (Password)" rules={[{ required: true }]}>
                    <Input.Password placeholder="Enter password" />
                </Form.Item>
                <Form.Item name="remarks" label="备注 (Remarks)">
                    <Input.TextArea placeholder="Enter remarks" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">创建 (Create)</Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default CreateSubAccountPage;