// import React, { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, useNavigate, Link, Outlet } from 'react-router-dom';
// import {
//   Layout,
//   Menu,
//   theme,
//   Typography
// } from 'antd';
// import {
//   UserOutlined,
//   DesktopOutlined,
//   PieChartOutlined,
//   TeamOutlined,
//   FileOutlined,
//   SettingOutlined,
//   HistoryOutlined,
//   BarChartOutlined,
//   GlobalOutlined,
//   MessageOutlined
// } from '@ant-design/icons';

// // Page Imports
// import HomePage from './pages/HomePage';
// import AgentListPage from './pages/AgentListPage';
// import CreateAgentPage from './pages/CreateAgentPage';
// import ActivityLogPage from './pages/ActivityLogPage';
// import GamePage from './pages/GamePage';
// import CommisionPage from './pages/CommisionPage';
// import SubAccountPage from './pages/SubAccountPage';
// import TreePage from './pages/TreePage';
// import ChangePasswordPage from './pages/ChangePasswordPage';
// import LanguagePage from './pages/LanguagePage';
// import SalesReportPage from './pages/SalesReportPage';
// import CreateSubAccountPage from './pages/CreateSubAccountPage';
// import LandingPage from './pages/LandingPage';
// import LoginPage from './pages/LoginPage';
// import ProtectedRoute from './pages/components/ProtectedRoute';
// import { useAuth } from './pages/context/AuthContext'; 
// import DashboardPage from './pages/DashboardPage';

// const { Header, Content, Sider } = Layout;
// const { Title } = Typography;

// const ALL_MENU_ITEMS = [
//     { label: '主页', key: '/dashboard', roles: ['admin', 'agent'] },
//     // { label: '平台', key: '/platform', roles: ['admin'] },
//     // { label: '用户管理', key: '/users', roles: ['agent'] },
//     // { label: '代理商', key: '/agents', roles: ['admin'] },
//     // { label: '创建代理商', key: '/agents/create', roles: ['admin'] },
//     // { label: '子账户', key: '/sub-accounts', roles: ['admin'] },
//     // { label: '创建子账户', key: '/sub-accounts/create', roles: ['admin'] },
//     // { label: '佣金报表', key: '/commission', roles: ['admin'] },
//     // { label: '销售报表', key: '/reports/sales', roles: ['admin'] },
//     // { label: 'P 报表', key: '/reports/p-report', roles: ['admin'] },
//     // { label: '游戏', key: '/games', roles: ['admin', 'agent'] },
//     // { label: '活动日志', key: '/activity-logs', roles: ['admin', 'agent', 'user'] },
//     // { label: '树形视图', key: '/tree-view', roles: ['admin'] },
//     // { label: '更改密码', key: '/change-password', roles: ['admin', 'agent'] },
//     // { label: '语言设置', key: '/language', roles: ['admin'] },
// ];

// const SideNav = () => {
//   const { user } = useAuth(); // Get the current logged-in user
//     const navigate = useNavigate();

//     // Debug: Log the current user and role
//     console.log('Current user:', user);
//     console.log('User role:', user?.role);

//     // Filter the menu items based on the user's role
//     const accessibleMenuItems = ALL_MENU_ITEMS.filter(item => 
//         item.roles.includes(user?.role)
//     );

//     console.log('Accessible menu items:', accessibleMenuItems);

//     const onClick = (e) => navigate(e.key);

//     return (
//         <Menu 
//             theme="dark"
//             mode="inline"
//             items={accessibleMenuItems} // Render the filtered items
//             onClick={onClick}
//         />
//     );
// }

// // The main dashboard layout. It now uses <Outlet /> to render nested routes.
// const DashboardLayout = () => {
//   const [collapsed, setCollapsed] = useState(() => {
//     const saved = localStorage.getItem('sidebarCollapsed');
//     return saved !== null ? JSON.parse(saved) : true;
//   });
//   const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

//   const handleCollapse = (value) => {
//     setCollapsed(value);
//     localStorage.setItem('sidebarCollapsed', JSON.stringify(value));
//   };

//   return (
//     <Layout style={{ minHeight: '100vh' }}>
//       <Sider 
//         collapsible 
//         collapsed={collapsed} 
//         onCollapse={handleCollapse}
//         theme="dark"
//         style={{ background: '#1f2937' }}
//       >
//         <div style={{ height: '32px', margin: '16px', color: 'white', textAlign: 'center', fontSize: '18px' }}>
//           <Link to="/dashboard" style={{ color: 'white' }}>{collapsed ? 'B' : 'BGM9001'}</Link>
//         </div>
//         <SideNav />
//       </Sider>
//       <Layout>
//         <Header style={{ padding: '0 24px', background: colorBgContainer }} />
//         <Content style={{ margin: '24px 16px 0' }}>
//           <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
//             <Outlet /> {/* Child routes will render here */}
//           </div>
//         </Content>
//       </Layout>
//     </Layout>
//   );
// };

// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         {/* --- Public Routes --- */}
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/login" element={<LoginPage />} />

//         {/* --- Protected Routes --- */}
//         {/* This <ProtectedRoute> acts as a guard for the entire dashboard */}
//         <Route element={<ProtectedRoute />}>
        
//           {/* CORRECTION:
//             The DashboardLayout route is now the PARENT for all dashboard pages.
//             It will render the sidebar and header, and its <Outlet /> will render
//             the specific page component (AgentListPage, CreateAgentPage, etc.).
//           */}
//           <Route path="/" element={<DashboardLayout />}>
//             {/* The default page for the dashboard */}
//             <Route index element={<AgentListPage />} /> 
            
//             {/* All other dashboard pages are now nested as children */}
//             <Route path="dashboard" element={<DashboardPage />} />
//             <Route path="users" element={<AgentListPage />} />
//             <Route path="agents" element={<AgentListPage />} />
//             <Route path="agents/create" element={<CreateAgentPage />} />
//             <Route path="sub-accounts" element={<SubAccountPage />} />
//             <Route path="sub-accounts/create" element={<CreateSubAccountPage />} />
//             <Route path="reports/sales" element={<SalesReportPage />} />
//             <Route path="reports/p-report" element={<Title level={3}>P Report Page</Title>} />
//             <Route path="activity-logs" element={<ActivityLogPage />} />
//             <Route path="games" element={<GamePage />} />
//             <Route path="commission" element={<CommisionPage />} />
//             <Route path="tree-view" element={<TreePage />} />
//             <Route path="change-password" element={<ChangePasswordPage />} />
//             <Route path="language" element={<LanguagePage />} />

//             {/* You might want a "catch-all" or "Not Found" route here too! */}
//             <Route path="*" element={<Title level={3}>Page Not Found</Title>} />
//           </Route>
//         </Route>

//       </Routes>
//     </Router>
//   );
// };

// export default App;