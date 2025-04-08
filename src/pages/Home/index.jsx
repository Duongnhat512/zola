import React, { useEffect, useState } from "react";
import {
  MessageOutlined,
  TeamOutlined,
  FileOutlined,
  CloudSyncOutlined,
  CloudFilled,
  ToolFilled,
  SettingFilled,
  UserOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, Dropdown, Layout, Menu } from "antd";
import Profile from "../Profile/Profile";
import { logoutUser } from "../../services/UserService";
import { toast, ToastContainer } from "react-toastify";

const { Content, Sider } = Layout;

const Home = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Redux state
  const isAuthenticated = useSelector((state) => state.user.authenticated);
  useSelector((state) => console.log(state.user)
  )
  const user = useSelector((state) => state.user.user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleLogout = async () => {
    try {
      const res = await logoutUser(user.username);
      if (res) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
    }
  };
  // Menu items
  const menuItemsTop = [
    { label: "Tin nhắn", key: "1", icon: <MessageOutlined /> },
    { label: "Team", key: "2", icon: <TeamOutlined /> },
    { label: "Files", key: "3", icon: <FileOutlined /> },
  ];

  const menuItemsBottom = [
    { label: "Zola Cloud", key: "1", icon: <CloudSyncOutlined /> },
    { label: "Cloud của tôi", key: "2", icon: <CloudFilled /> },
    { label: "Công cụ", key: "3", icon: <ToolFilled /> },
    { label: "Cài đặt", key: "4", icon: <SettingFilled /> },
  ];

  const dropdownItems = [
    { label: user?.fullname || "Người dùng", key: "0" },
    { type: "divider" },
    { label: "Nâng cấp tài khoản", key: "1" },
    {
      label: "Hồ sơ của bạn",
      key: "2",
      onClick: () => {
        showModal();
      },
    },
    { label: "Cài đặt", key: "3" },
    { type: "divider" },
    { label: "Đăng xuất", key: "4", onClick: handleLogout },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Profile isModalOpen={isModalOpen} setModalOpen={setIsModalOpen} />
      <Sider
        collapsed={collapsed}
        style={{
          background: "#005ae0",
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%", // Quan trọng để flex hoạt động
          }}
        >
          {/* Dropdown Avatar */}
          <Dropdown
            menu={{ items: dropdownItems }}
            trigger={["click"]}
            placement="bottomRight"
            align={{ offset: [140, -50] }} // Điều chỉnh khoảng cách menu so với avatar
          >
            <a onClick={(e) => e.preventDefault()}>
              <Avatar
                src={user?.avt || ""}
                style={{
                  margin: "10px auto",
                  display: "block",
                }}
                size={64}
                icon={!user?.avt && <UserOutlined />}
              />
            </a>
          </Dropdown>

          {/* User Info */}
          <div
            style={{
              textAlign: "center",
              color: "#fff",
              marginTop: "10px",
              fontSize: "14px",
            }}
          >
            <div>{user?.fullname || "Người dùng"}</div>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>
              {user?.status || "Offline"}
            </div>
          </div>

          {/* Menu Items Top */}
          <Menu
            theme="dark"
            defaultSelectedKeys={["1"]}
            mode="inline"
            items={menuItemsTop}
            style={{
              background: "#005ae0",
              marginTop: "20px",
              flexGrow: 1, // Đẩy phần dưới xuống
            }}
          />

          {/* Menu Items Bottom */}
          <Menu
            theme="dark"
            defaultSelectedKeys={["1"]}
            mode="inline"
            items={menuItemsBottom}
            style={{
              background: "#005ae0",
            }}
          />
        </div>
      </Sider>

      {/* Main Layout */}
      <Layout>
        <Sider width="25%" style={{ background: "#fff" }}>
          <div style={{ padding: "20px", textAlign: "center" }}>Sider</div>
        </Sider>
        <Content
          style={{
            padding: "20px",
            background: "#ebecf0",
            minHeight: "100vh",
          }}
        >
          <h1 style={{ textAlign: "center" }}>Content</h1>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
