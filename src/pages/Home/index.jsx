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
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, Dropdown, Layout, Menu } from "antd";
import Profile from "../Profile/Profile";
import HomeDetails from "./HomeDetails";
import { logoutUser } from "../../services/UserService";
import { toast, ToastContainer } from "react-toastify";
import { logout } from "../../redux/UserSlice";
import MainLayout from "../../components/ChatApp/MainLayout";

const { Content, Sider } = Layout;

const Home = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [layout, setLayout] = useState("default"); // State to manage layout type
  // Redux state
  const isAuthenticated = useSelector((state) => state.user.authenticated);
  const user = useSelector((state) => state.user.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
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
    console.log("Đang đăng xuất...");

    try {
      const res = await logoutUser(user.username);
      if (res) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        dispatch(logout());
        navigate("/login");
        // Gọi action logoutUser để cập nhật trạng thái đăng nhập trong Redux
      }
    } catch (err) {
      console.error(err);
    }
  };
  // Menu items
  const menuItemsTop = [
    {
      label: "Tin nhắn",
      key: "1",
      icon: <MessageOutlined />,
      onClick: () => {
        setLayout("default");
      },
    },
    {
      label: "Team",
      key: "2",
      icon: <TeamOutlined />,
      onClick: () => {
        setLayout("mainlayout");
      },
    },
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
  const toggleCollapsed = () => {
    console.log(collapsed);

    setCollapsed(!collapsed);
  };

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
          <Button
            type="text"
            onClick={toggleCollapsed}
            style={{
              color: "#fff",
              margin: "10px auto",
              display: "block",
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </div>
      </Sider>

      <Content>
        {layout === "default" ? <HomeDetails /> : <MainLayout />}
      </Content>
    </Layout>
  );
};

export default Home;
