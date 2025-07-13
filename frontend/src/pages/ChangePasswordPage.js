import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import axios from 'axios';

const ChangePasswordPage = () => {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        axios.post('http://localhost:5001/api/user/change-password', values)
            .then(response => {
                message.success(response.data.message);
                form.resetFields();
            })
            .catch(error => {
                message.error(error.response.data.message || 'An error occurred.');
            });
    };

    return (
        <Card title="更换密码 (Change Password)">
            <Form form={form} onFinish={onFinish} layout="vertical" style={{ maxWidth: 400 }}>
                <Form.Item
                    name="currentPassword"
                    label="目前的密码 (Current Password)"
                    rules={[{ required: true, message: 'Please enter your current password!' }]}
                >
                    <Input.Password placeholder="Enter current password" />
                </Form.Item>
                <Form.Item
                    name="newPassword"
                    label="新密码 (New Password)"
                    rules={[{ required: true, message: 'Please enter your new password!' }]}
                >
                    <Input.Password placeholder="Enter new password" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        更新 (Update)
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ChangePasswordPage;