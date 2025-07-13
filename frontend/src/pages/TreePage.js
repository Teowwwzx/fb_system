import React, { useState, useEffect } from 'react';
import { Tree, Card, Input, Typography } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { Search } = Input;

const TreePage = () => {
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5001/api/agents/tree')
            .then(response => {
                setTreeData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching tree data:", error);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <Title level={4}>树视图 (Tree View)</Title>
            <Card title="代理级别结构 (Agent Level Structure)" style={{ marginTop: 24 }}>
                <Search placeholder="搜索用户名 (Search Username)" style={{ marginBottom: 16 }} />
                {loading ? <p>Loading...</p> : (
                    <Tree
                        showLine
                        showIcon
                        defaultExpandAll
                        treeData={treeData}
                        icon={(props) => (props.children ? <TeamOutlined /> : <UserOutlined />)}
                    />
                )}
            </Card>
        </div>
    );
};

export default TreePage;