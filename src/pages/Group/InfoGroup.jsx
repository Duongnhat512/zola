import React from "react";
import { Avatar, Button, Collapse, Tooltip, Card, Divider } from "antd";
import {
  BellOutlined,
  PushpinOutlined,
  UserAddOutlined,
  SettingOutlined,
  LinkOutlined,
  TeamOutlined,
  HomeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const InfoGroup = ({selectedChat}) => {
  return (
    <Card 
      
      className="max-w-[450px] max-h-[600px] h-full p-0 rounded-2xl shadow-lg overflow-auto"
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div className="flex flex-col items-center py-6 bg-gradient-to-r from-blue-100 to-blue-50 rounded-t-2xl">
        <Avatar.Group
          maxCount={3}
          size={64}
          maxStyle={{ color: "#fff", backgroundColor: "#1890ff" }}
        >
          <Avatar src="https://via.placeholder.com/150" />
          <Avatar style={{ backgroundColor: "#87d068" }}>ND</Avatar>
          <Avatar style={{ backgroundColor: "#f56a00" }}>QĐ</Avatar>
        </Avatar.Group>
        <h2 className="text-xl font-semibold mt-4 flex items-center gap-2 text-center">
          <TeamOutlined /> Nhóm: Ngô Quốc Đạt, Nguyễn Nh...
        </h2>
      </div>

      <Divider className="my-4" />

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-4 px-6 mb-6 text-center">
        <Tooltip title="Tắt thông báo">
          <Button
            icon={<BellOutlined />}
            type="ghost"
            className="flex flex-col items-center justify-center"
            size="large"
          >
            <span className="text-xs mt-1">Thông báo</span>
          </Button>
        </Tooltip>
        <Tooltip title="Ghim hội thoại">
          <Button
            icon={<PushpinOutlined />}
            type="ghost"
            className="flex flex-col items-center justify-center"
            size="large"
          >
            <span className="text-xs mt-1">Ghim</span>
          </Button>
        </Tooltip>
        <Tooltip title="Thêm thành viên">
          <Button
            icon={<UserAddOutlined />}
            type="ghost"
            className="flex flex-col items-center justify-center"
            size="large"
          >
            <span className="text-xs mt-1">Thêm</span>
          </Button>
        </Tooltip>
        <Tooltip title="Quản lý nhóm">
          <Button
            icon={<SettingOutlined />}
            type="ghost"
            className="flex flex-col items-center justify-center"
            size="large"
          >
            <span className="text-xs mt-1">Cài đặt</span>
          </Button>
        </Tooltip>
      </div>

      <Divider className="my-4" />

      {/* Group Info */}
      <div className="space-y-6 px-6 text-sm">
        <div className="flex items-center gap-3">
          <TeamOutlined className="text-blue-500 text-lg" />
          <div>
            <h3 className="font-semibold text-gray-800">Thành viên nhóm</h3>
            <p className="text-gray-600">3 thành viên</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <LinkOutlined className="text-green-500 text-lg mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800">Link tham gia nhóm</h3>
            <a
              href="https://zalo.me/g/lcbwlu888"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all"
            >
              zalo.me/g/lcbwlu888
            </a>
          </div>
        </div>
      </div>

      <Divider className="my-4" />

      {/* Extra Features */}
      <div className="px-6 pb-6">
        <Collapse ghost className="text-sm">
          <Collapse.Panel
            header={
              <span className="flex items-center gap-2">
                <HomeOutlined /> Bảng tin nhóm
              </span>
            }
            key="1"
          >
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Danh sách nhắc hẹn</li>
              <li>Ghi chú, ghim, bình chọn</li>
            </ul>
          </Collapse.Panel>
          <Collapse.Panel
            header={
              <span className="flex items-center gap-2">
                <CalendarOutlined /> Ảnh / Video
              </span>
            }
            key="2"
          >
            <p className="text-gray-500 italic">
              Chưa có ảnh/video được chia sẻ trong hội thoại này.
            </p>
          </Collapse.Panel>
        </Collapse>
      </div>
    </Card>
  );
};

export default InfoGroup;
