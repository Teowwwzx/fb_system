import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import {
  Layout,
  Menu,
  theme,
  Typography
} from 'antd';
import {
  UserOutlined,
  DesktopOutlined,
  PieChartOutlined,
  TeamOutlined,
  FileOutlined,
  SettingOutlined,
  HistoryOutlined,
  BarChartOutlined,
  GlobalOutlined,
  MessageOutlined
} from '@ant-design/icons';

// Import our new page component (we will create this next)
import AgentListPage from './pages/AgentListPage';
import CreateAgentPage from './pages/CreateAgentPage';
import ActivityLogPage from './pages/ActivityLogPage';
import GamePage from './pages/GamePage';
import CommisionPage from './pages/CommisionPage';
import SubAccountPage from './pages/SubAccountPage';
import TreePage from './pages/TreePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import LanguagePage from './pages/LanguagePage';
import SalesReportPage from './pages/SalesReportPage';
import CreateSubAccountPage from './pages/CreateSubAccountPage';
import LandingPage from './pages/LandingPage'; // Import LandingPage
import LoginPage from './pages/LoginPage'; // Import LoginPage

const { Header, Content, Sider } = Layout;
const { Title } = Typography;
const SideNav = () => {
  const navigate = useNavigate();
  const menuItems = [
    { label: '总代理', key: '/agents', icon: <UserOutlined /> },
    { label: '子账户', key: '/sub-accounts', icon: <TeamOutlined /> },
    { label: '创建子账户', key: '/sub-accounts/create', icon: <TeamOutlined /> },
    { label: '代理', key: '/agent-management', icon: <DesktopOutlined />, 
        children: [
            { label: '代理列表', key: '/agents' },
            { label: '创建代理', key: '/agents/create' }
        ]
    },
    { label: '游戏', key: '/games', icon: <PieChartOutlined /> },
    { label: '树视图', key: '/tree-view', icon: <FileOutlined /> },
    { label: '活动日志', key: '/activity-logs', icon: <HistoryOutlined /> },
    { label: '交易日志', key: '/transaction-logs', icon: <BarChartOutlined /> },
    { label: 'Commission', key: '/commission', icon: <SettingOutlined /> },
    { label: '语言', key: '/language', icon: <GlobalOutlined /> },
    { label: '报告', key: '/reports', icon: <BarChartOutlined />,
      children: [
          { label: '销售报告', key: '/reports/sales' },
          { label: 'P报告', key: '/reports/p-report' },
      ]
  },    
    { label: '反馈', key: '/feedback', icon: <MessageOutlined /> },
  ];

  const onClick = (e) => {
    navigate(e.key);
  };

  return (
      <Menu 
          theme="dark" 
          defaultSelectedKeys={['/agents']} 
          defaultOpenKeys={['/agent-management']}
          mode="inline" 
          items={menuItems}
          onClick={onClick}
          style={{ background: '#1f2937' }}
      />
  );
}

// The main dashboard layout including sidebar and header
const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
        style={{ background: '#1f2937' }}
      >
        <div style={{ height: '32px', margin: '16px', color: 'white', textAlign: 'center', fontSize: '18px' }}>
          <Link to="/dashboard" style={{ color: 'white' }}>{collapsed ? 'B' : 'BGM9001'}</Link>
        </div>
        <SideNav />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer }}>
          {/* Header content can remain here */}
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

// A wrapper for dashboard routes
const DashboardRoutes = () => (
  <DashboardLayout>
    <Routes>
      <Route path="/dashboard" element={<AgentListPage key="agents-dashboard" />} />
      <Route path="/agents" element={<AgentListPage key="agents" />} />
      <Route path="/agents/create" element={<CreateAgentPage onAgentCreated={() => window.location.href = '/agents'} />} />
      <Route path="/sub-accounts" element={<SubAccountPage />} />
      <Route path="/sub-accounts/create" element={<CreateSubAccountPage />} />
      <Route path="/reports/sales" element={<SalesReportPage />} />
      <Route path="/reports/p-report" element={<Title level={3}>P Report Page</Title>} />
      <Route path="/activity-logs" element={<ActivityLogPage />} />
      <Route path="/games" element={<GamePage />} />
      <Route path="/commission" element={<CommisionPage />} />
      <Route path="/tree-view" element={<TreePage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route path="/language" element={<LanguagePage />} />
    </Routes>
  </DashboardLayout>
);

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes that do not have the dashboard layout */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* All other routes are part of the dashboard */}
        <Route path="/*" element={<DashboardRoutes />} />
      </Routes>
    </Router>
  );
};

export default App;