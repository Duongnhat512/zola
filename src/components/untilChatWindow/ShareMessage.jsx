import React, { useState } from "react";
import { Modal, Tabs, Input, List, Avatar, Button, Checkbox } from "antd";
import { getConversationRecent } from "../../services/Conversation";
import { useEffect } from "react";
import { ArrowUpOutlined, MessageOutlined, MoreOutlined } from "@ant-design/icons";
import { Dropdown, Menu } from "antd";

const { TabPane } = Tabs;

const ShareMessageModal = ({
    userId,
    visible,
    onCancel,
    onShare,
    messagePreview,
}) => {
    const [conversations, setConversations] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [tabKey, setTabKey] = useState("recent");
    const [search, setSearch] = useState("");
    const [note, setNote] = useState("");
    const handleGetConversationRecent = async () => {
        const response = await getConversationRecent(userId);
        console.log(response);

        if (response.status === 'success') {
            setConversations(response.conversations);
        } else {
            console.error("Failed to fetch recent conversations");
        }
    }
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                await handleGetConversationRecent();
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        fetchConversations();
    }, [])
    const handleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };
    // Filter conversations by search
    const filtered = conversations?.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );
    return (
        <Modal
            title="Chia sẻ"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="share"
                    type="primary"
                    disabled={selectedIds.length === 0}
                    onClick={() => onShare(selectedIds, note)}
                >
                    Chia sẻ
                </Button>,
            ]}
            width={500}
            centered
        >
            <Input.Search
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            <Tabs activeKey={tabKey} onChange={setTabKey}>
                <TabPane tab="Gần đây" key="recent">
                    <List
                        dataSource={filtered}
                        renderItem={(item) => (
                            <List.Item
                                style={{
                                    background: selectedIds.includes(item.conversation_id) ? "#f5f6fa" : undefined,
                                    cursor: "pointer",

                                }}
                                onClick={() => handleSelect(item.conversation_id)}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Checkbox checked={selectedIds.includes(item.conversation_id)} />
                                    <Avatar src={item.avatar || './default.jpg'} style={{ margin: 0 }} />
                                    <span>{item.name}</span>

                                </div>
                            </List.Item>

                        )}
                    />
                </TabPane>
                <TabPane tab="Nhóm trò chuyện" key="groups">
                    {/* Render group list here */}
                </TabPane>
                <TabPane tab="Bạn bè" key="friends">
                    {/* Render friends list here */}
                </TabPane>
            </Tabs>
            <div
                style={{
                    background: "#f5f6fa",
                    padding: 12,
                    borderRadius: 6,
                    margin: "16px 0 8px 0",
                }}
            >
                <b>Chia sẻ tin nhắn</b>
                <div style={{ marginTop: 4 }}>{messagePreview}</div>
            </div>
            <Input.TextArea
                placeholder="Nhập tin nhắn..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
            />
        </Modal>
    );
};

const PinnedListBlock = ({
    permission,
    pinnedMessages = [],
    onUnpin,
    onViewMessage,
    onViewAll,
    onClose
}) => {
    return (
        <div
            style={{
                background: "#f7f8fa",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                overflow: "hidden",
                marginTop: 24,
            }}
            className="sticky top-0 z-20 mb-4"
        >
            <div
                style={{
                    background: "#f1f2f5",
                    padding: "12px 16px",
                    fontWeight: 600,
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <div>Danh sách ghim ({pinnedMessages.length})</div>
                <Button onClick={onClose}>
                    Thu gọn <ArrowUpOutlined></ArrowUpOutlined>
                </Button>
            </div>


            <List
                dataSource={pinnedMessages}
                renderItem={(item) => (
                    <List.Item
                        style={{
                            background: "#fff",
                            borderBottom: "1px solid #f0f0f0",
                            padding: "12px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <MessageOutlined style={{ color: "#1890ff", fontSize: 22 }} />
                            <div>
                                <div style={{ fontWeight: 500, color: "#222" }}>Tin nhắn</div>
                                <div
                                    style={{
                                        color: "#444",
                                        fontSize: 15,
                                        marginTop: 2,
                                        maxWidth: 400,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {item.senderName ? `${item.senderName}: ` : ""}
                                    {(() => {
                                        let files = [];
                                        try {
                                            if (item.media) {
                                                files = JSON.parse(item.media);
                                            }
                                        } catch (error) {
                                            console.error("Lỗi parse media:", error);
                                        }
                                        const isURL = /^https?:\/\/.+/i.test(files[0]?.fileUrl);
                                        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(files[0]?.fileUrl);
                                        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(files[0]?.fileUrl);

                                        if (isURL && isImage) {
                                            return <img src={files[0].fileUrl} alt="Hình ảnh" className="w-14 rounded-md" />;
                                        } else if (isURL && isVideo) {
                                            return (
                                                <video controls className="w-20 rounded-md">
                                                    <source src={files[0].fileUrl} type="video/mp4" />
                                                    Trình duyệt không hỗ trợ video.
                                                </video>
                                            );
                                        } else {
                                            return <span>{item.text}</span>;
                                        }
                                    })()}

                                </div>
                            </div>
                        </div>
                        <Dropdown
                            overlay={
                                <Menu>
                                    <Menu.Item key="view" onClick={() => onViewMessage(item)}>
                                        <a
                                            href={`#msg-${item.id}`}
                                            className="text-blue-500"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const el = document.getElementById(`msg-${item.id}`);
                                                if (el) {
                                                    el.scrollIntoView({ behavior: "smooth", block: "center" });

                                                    // Thêm lớp nền highlight
                                                    el.classList.add("text-red-600");

                                                    // Xóa highlight sau 2 giây (hoặc thời gian tùy chọn)
                                                    setTimeout(() => {
                                                        el.classList.remove("text-red-600");
                                                    }, 2000);
                                                }
                                            }}
                                        >
                                            Xem
                                        </a>
                                    </Menu.Item>
                                    {(
                                        <Menu.Item key="unpin" onClick={() => onUnpin(item)}>
                                            Bỏ ghim
                                        </Menu.Item>
                                    )}
                                </Menu>
                            }
                            trigger={["click"]}
                            placement="bottomRight"
                        >
                            <MoreOutlined style={{ fontSize: 20, color: "#888", cursor: "pointer" }} />
                        </Dropdown>
                    </List.Item>
                )}
                locale={{ emptyText: <span style={{ color: '#888' }}>Chưa có tin nhắn ghim nào</span> }}
                style={{
                    background: "#fff",
                    maxHeight: 320,
                    overflowY: "auto",
                }}
            />


        </div>
    );
};

export default ShareMessageModal;
export { PinnedListBlock };