import React, { useState } from 'react';
import { Card, Select, Typography, message } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const LanguagePage = () => {
    const [language, setLanguage] = useState('English');

    const handleChange = (value) => {
        setLanguage(value);
        message.success(`Language changed to ${value}`);
    };

    return (
        <Card title="语言 (Language)">
            <Title level={5}>选择您的语言 (Select Your Language)</Title>
            <Select defaultValue="English" style={{ width: 200 }} onChange={handleChange}>
                <Option value="English">English</Option>
                <Option value="BM">Bahasa Malaysia</Option>
                <Option value="中文">中文</Option>
            </Select>
            <Text style={{ display: 'block', marginTop: 20 }}>
                This is a demonstration. A full implementation would require an i18n library.
            </Text>
        </Card>
    );
};

export default LanguagePage;