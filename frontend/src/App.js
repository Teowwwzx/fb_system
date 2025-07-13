import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, Outlet } from 'react-router-dom';
import {
  Layout,
  Menu,
  theme,
  Typography
} from 'antd';
import {
  DesktopOutlined,
  UserOutlined,
  HistoryOutlined,
  TransactionOutlined,
  ApartmentOutlined,
  LockOutlined,
  GlobalOutlined,
  LogoutOutlined,
  TeamOutlined,
  AppstoreOutlined,
  DollarCircleOutlined,
  BarChartOutlined,
  SolutionOutlined
} from '@ant-design/icons';

// Page Imports
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
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './pages/components/ProtectedRoute';
import { useAuth } from './pages/context/AuthContext'; 
import DashboardPage from './pages/DashboardPage';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const ALL_MENU_ITEMS = [
  // --- Admin Menu Items (Chinese) ---
  { label: '主页', key: '/dashboard', icon: <DesktopOutlined />, roles: ['admin'] },
  { 
    label: '总代理', 
    key: 'parent-agents', 
    icon: <UserOutlined />, 
    roles: ['admin'],
    children: [
      { label: '列表', key: '/agents', roles: ['admin'] },
      { label: '创建', key: '/agents/create', roles: ['admin'] },
    ]
  },
  { 
    label: '子账户', 
    key: 'user-account', 
    icon: <TeamOutlined />, 
    roles: ['admin'],
    children: [
      { label: '列表', key: '/sub-accounts', roles: ['admin'] },
      { label: '创建', key: '/sub-accounts/create', roles: ['admin'] },
    ]
  },
  { 
    label: '代理', 
    key: 'child-agent', 
    icon: <SolutionOutlined />, 
    roles: ['admin'],
    children: [
      { label: '列表', key: '/child-agent/list', roles: ['admin'] },
      { label: '创建', key: '/child-agent/create', roles: ['admin'] },
    ]
  },
  { label: '游戏', key: '/games', icon: <AppstoreOutlined />, roles: ['admin'] },
  { label: '树形视图', key: '/tree-view', icon: <ApartmentOutlined />, roles: ['admin'] },
  { label: '活动日志', key: '/activity-logs', icon: <HistoryOutlined />, roles: ['admin'] },
  { label: '交易日志', key: '/transactions', icon: <TransactionOutlined />, roles: ['admin'] },
  { 
    label: '报告', 
    key: 'reports', 
    icon: <BarChartOutlined />, 
    roles: ['admin'],
    children: [
        { label: '佣金报表', key: '/commission', roles: ['admin'] },
    ]
  },

  // --- Agent Menu Items (English) ---
  { label: 'Dashboard', key: '/dashboard', icon: <DesktopOutlined />, roles: ['agent'] },
  { label: 'Products', key: '/products', icon: <AppstoreOutlined />, roles: ['agent'] },
  { label: 'Users', key: '/users', icon: <UserOutlined />, roles: ['agent'] },
  { label: 'Activity Log', key: '/activity-logs', icon: <HistoryOutlined />, roles: ['agent'] },
  { label: 'Transaction Log', key: '/transactions', icon: <TransactionOutlined />, roles: ['agent'] },
  { label: 'Tree View', key: '/tree-view', icon: <ApartmentOutlined />, roles: ['agent'] },
  
  // --- Shared Menu Items ---
  { label: 'Change Password', key: '/change-password', icon: <LockOutlined />, roles: ['admin', 'agent', 'user'] },
  { label: 'Language', key: '/language', icon: <GlobalOutlined />, roles: ['admin', 'agent', 'user'] },
  { label: 'Logout', key: '/logout', icon: <LogoutOutlined />, roles: ['admin', 'agent', 'user'] },
];

const SideNav = () => {
  const { user } = useAuth(); // Get the current logged-in user
    const navigate = useNavigate();

    // Filter the menu items based on the user's role
    const accessibleMenuItems = ALL_MENU_ITEMS.filter(item => 
        item.roles.includes(user?.role)
    );

    const onClick = (e) => navigate(e.key);

    return (
        <Menu 
            theme="dark"
            mode="inline"
            items={accessibleMenuItems} // Render the filtered items
            onClick={onClick}
        />
    );
}

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved !== null ? JSON.parse(saved) : false; // Start expanded
  });
  const { user } = useAuth();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const handleCollapse = (value) => {
    setCollapsed(value);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(value));
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={handleCollapse}
        theme="dark"
        style={{ background: '#1f2937' }}
      >
        <div style={{ padding: '16px', color: 'white', textAlign: 'center' }}>
            <Title level={4} style={{ color: 'white', marginBottom: 0 }}>{collapsed ? 'FB' : 'FB711'}</Title>
            {!collapsed && <Typography.Text style={{color: '#9ca3af'}}>{user?.username}</Typography.Text>}
        </div>
        <SideNav />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Typography.Text>DAILY LIMIT: <Typography.Text type="danger">0.00 (0.00)</Typography.Text></Typography.Text>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} /> 
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<GamePage />} />
            <Route path="users" element={<AgentListPage />} />
            <Route path="agents" element={<AgentListPage />} />
            <Route path="agents/create" element={<CreateAgentPage />} />
            <Route path="sub-accounts" element={<SubAccountPage />} />
            <Route path="sub-accounts/create" element={<CreateSubAccountPage />} />
            <Route path="child-agent/list" element={<Title level={3}>Child Agent List</Title>} />
            <Route path="child-agent/create" element={<Title level={3}>Create Child Agent</Title>} />
            <Route path="games" element={<GamePage />} />
            <Route path="activity-logs" element={<ActivityLogPage />} />
            <Route path="transactions" element={<Title level={3}>Transaction Log Page</Title>} />
            <Route path="commission" element={<CommisionPage />} />
            <Route path="tree-view" element={<TreePage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
            <Route path="language" element={<LanguagePage />} />
            <Route path="*" element={<Title level={3}>Page Not Found</Title>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;