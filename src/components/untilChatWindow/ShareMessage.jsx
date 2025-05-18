import React, { useState } from "react";
import { Modal, Tabs, Input, List, Avatar, Button, Checkbox } from "antd";
import { getConversationRecent } from "../../services/Conversation";
import { useEffect } from "react";

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

export default ShareMessageModal;