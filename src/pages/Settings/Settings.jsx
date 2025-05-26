import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { BellOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import NotificationSettings from '../../components/NotificationSettings';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const Settings = () => {
  const [selectedKey, setSelectedKey] = React.useState('notifications');

  const menuItems = [
    {
      key: 'notifications',
      icon: <BellOutlined />,
      label: 'Thông báo',
    },
    {
      key: 'account',
      icon: <UserOutlined />,
      label: 'Tài khoản',
    },
    {
      key: 'general',
      icon: <SettingOutlined />,
      label: 'Chung',
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'notifications':
        return <NotificationSettings />;
      case 'account':
        return (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Title level={3}>Cài đặt tài khoản</Title>
            <p>Tính năng đang được phát triển...</p>
          </div>
        );
      case 'general':
        return (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Title level={3}>Cài đặt chung</Title>
            <p>Tính năng đang được phát triển...</p>
          </div>
        );
      default:
        return <NotificationSettings />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={2} style={{ margin: 0, lineHeight: '64px' }}>
          Cài đặt
        </Title>
      </Header>
      <Layout>
        <Sider width={250} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => setSelectedKey(key)}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Settings; 