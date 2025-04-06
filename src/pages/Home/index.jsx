import React, { useState } from "react";
import {
  AntCloudOutlined,
  CloudFilled,
  CloudSyncOutlined,
  CloudTwoTone,
  DesktopOutlined,
  DownOutlined,
  FileOutlined,
  MessageOutlined,
  PieChartOutlined,
  SettingFilled,
  SettingTwoTone,
  TeamOutlined,
  ToolFilled,
  ToolTwoTone,
  UserOutlined,
} from "@ant-design/icons";

import { Avatar, Breadcrumb, Dropdown, Layout, Menu, Space, theme } from "antd";
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}
const itemss = [
  getItem("Tin nhắn", "1", <MessageOutlined />),
  getItem("Team", "sub2", <TeamOutlined />),
  getItem("Files", "9", <FileOutlined />),
];
const items2 = [
  getItem("Zola Cloud", "1", <CloudSyncOutlined />),
  getItem("Cloud của tôi", "2", <CloudFilled />),
  getItem("Công cụ", "3", <ToolFilled />),
  getItem("Cài đặt", "4", <SettingFilled />),
];
const contentStyle = {
  textAlign: "center",
  minHeight: 120,
  lineHeight: "120px",
  color: "#fff",
  backgroundColor: "#ebecf0",
};
const siderStyle = {
  textAlign: "center",
  lineHeight: "120px",
  color: "#fff",
  backgroundColor: "#fff",
};
const items = [
  {
    label: (
      <a
        href="https://www.antgroup.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Hiệp Võ
      </a>
    ),
    key: "0",
  },
  {
    type: "divider",
  },
  {
    label: (
      <a
        href="https://www.antgroup.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Nâng cấp tài khoản
      </a>
    ),
    key: "1",
  },
  {
    label: (
      <a
        href="https://www.aliyun.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Hồ sơ của bạn
      </a>
    ),
    key: "2",
  },
  {
    label: (
      <a
        href="https://www.aliyun.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Cài đặt
      </a>
    ),
    key: "3",
  },
  {
    type: "divider",
  },
  {
    label: (
      <a
        href="https://www.aliyun.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Đăng xuất
      </a>
    ),
    key: "4",
  },
];
const Home = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsed={!collapsed}
        style={{
          background: "#005ae0",
          color: "#fff",
        }}
      >
        <Dropdown
          menu={{ items }}
          trigger={["click"]}
          placement="bottomRight" // Điều chỉnh menu xuống dưới
          overlayStyle={{ top: 20, left: 75, right: "auto" }} // Đẩy menu ra bên phải
        >
          <a onClick={(e) => e.preventDefault()}>
            <Avatar
              style={{
                marginLeft: "10px",
                marginBottom: "20px",
                marginTop: "10px",
              }}
              size={64}
              icon={<UserOutlined />}
            />
          </a>
        </Dropdown>

        <div className="demo-logo-vertical" />

        <div className="flex justify-between flex-col gap-64">
          <Menu
            theme="dark"
            defaultSelectedKeys={["1"]}
            mode="inline"
            items={itemss}
            className="custom-menu"
            style={{
              background: "#005ae0",
            }}
          />

          <Menu
            theme="dark"
            defaultSelectedKeys={["1"]}
            mode="inline"
            items={items2}
            className="custom-menu"
            style={{
              background: "#005ae0",
            }}
          />
        </div>
      </Sider>
      <Layout>
        <Sider width="25%" style={siderStyle}>
          Sider
        </Sider>
        <Content style={contentStyle}>Content</Content>
      </Layout>
    </Layout>
  );
};
export default Home;
