import React, { useState, useEffect } from "react";
import { Modal, Tabs, Button, Select, Divider, Image, List, Avatar, Typography } from "antd";
import { ArrowLeftOutlined, DownOutlined, PlayCircleFilled, FileOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;
const { Text, Title } = Typography;

const MediaLibraryModal = ({ visible, onClose, mediaData }) => {
    const [activeTab, setActiveTab] = useState("images");
    const [sortBy, setSortBy] = useState("date");

    // Nhóm media theo ngày
    const groupMediaByDate = (mediaItems) => {
        // Giả sử mỗi item có created_at hoặc date
        const groups = {};

        if (!mediaItems) return [];

        mediaItems.forEach(item => {
            const date = new Date(item.created_at || item.date);
            const dateKey = `Ngày ${date.getDate()} Tháng ${date.getMonth() + 1}`;

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }

            groups[dateKey].push(item);
        });

        // Convert to array of { date, items }
        return Object.keys(groups).map(date => ({
            date,
            items: groups[date]
        }));
    };

    const renderImageVideo = (item) => {
        if (item.type?.includes('video') || item.file_type?.includes('video')) {
            return (
                <div className="relative">
                    <video
                        src={item.media}
                        controls
                        style={{
                            maxWidth: "100%",
                            borderRadius: "8px",
                        }}
                    />

                </div>
            );
        }

        return (
            <Image
                src={item.media}
                alt="Media"
                className="w-full h-full object-cover rounded-md"
                preview={true}
            />
        );
    };

    const renderFileItem = (item) => {
        return (
            <List.Item>
                <div className="flex items-center w-full">
                    <div className="flex-shrink-0 mr-3">
                        <Avatar shape="square" size={48} icon={<FileOutlined />} style={{ backgroundColor: "#1890ff" }} />
                    </div>
                    <div className="flex-grow min-w-0">
                        <div className="font-medium text-gray-800 truncate">{item.name || item.file_name}</div>
                        <div className="text-xs text-gray-500 flex justify-between">
                            <span>{item.size ? `${Math.round(item.size / 1024)} KB` : ''}</span>
                            <span>{new Date(item.date || item.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </List.Item>
        );
    };

    // Nhóm dữ liệu theo tab đang active
    const getGroupedData = () => {
        let data;

        if (activeTab === "images") {
            data = [...(mediaData.images || []), ...(mediaData.videos || [])];
        } else if (activeTab === "files") {
            data = mediaData.files || [];
        } else {
            data = mediaData.links || [];
        }

        return groupMediaByDate(data);
    };

    const groupedData = getGroupedData();

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
            className="media-library-modal"
            closeIcon={null}
        >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b">
                <div className="flex items-center">
                    <Button type="text" icon={<ArrowLeftOutlined />} onClick={onClose} />
                    <span className="text-xl font-medium ml-2">Kho lưu trữ</span>
                </div>
                <Button type="text">Chọn</Button>
            </div>

            {/* Tabs */}
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="media-library-tabs"
                centered
            >
                <TabPane tab="Ảnh/Video" key="images" />
                <TabPane tab="Files" key="files" />
                <TabPane tab="Links" key="links" />
            </Tabs>

            {/* Filter */}
            <div className="px-4 py-2 bg-gray-100">
                <Select
                    value={sortBy}
                    onChange={setSortBy}
                    style={{ width: '100%' }}
                    suffixIcon={<DownOutlined />}
                    bordered={false}
                    options={[{ value: 'date', label: 'Ngày gửi' }]}
                />
            </div>

            {/* Content */}
            <div className="p-4">
                {groupedData.map((group, index) => (
                    <div key={index} className="mb-6">
                        <h3 className="text-lg font-medium mb-3">{group.date}</h3>

                        {activeTab === "images" ? (
                            <div className="grid grid-cols-2 gap-4">
                                {group.items.map((item, i) => (
                                    <div key={i} className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden">
                                        {renderImageVideo(item)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <List
                                itemLayout="horizontal"
                                dataSource={group.items}
                                renderItem={renderFileItem}
                                className="bg-white rounded-md"
                            />
                        )}
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default MediaLibraryModal;